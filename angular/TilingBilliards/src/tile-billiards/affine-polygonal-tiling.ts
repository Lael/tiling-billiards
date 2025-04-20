import {PolygonalTiling} from "./polygonal-tiling";
import {AffineTile} from "./affine-tile";
import {
  BufferGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Matrix4,
  MeshBasicMaterial,
  Scene,
  Shape,
  ShapeGeometry,
  Vector2
} from "three";
import {AffinePolygon, AffinePolygonRayCollision} from "./affine-polygon";
import {AffineRay} from "./affine-ray";
import {Complex} from "../math/complex";
import {EPSILON} from "../math/math-helpers";

export abstract class AffinePolygonalTiling<T extends AffineTile> extends PolygonalTiling<T, AffinePolygon> {
  meshes: InstancedMesh[] = [];
  billiardPath: Line | undefined = undefined;

  updateMeshes() {
    this.dirty = false;
    this.meshes = [];
    for (let i = 0; i < this.tileset.length; i++) {
      let {polygon, color} = this.tileset[i];
      const shape = new Shape().setFromPoints(polygon.scale(0.99).vertices);
      const tileGeometry = new ShapeGeometry(shape);
      let im = new InstancedMesh(
        tileGeometry,
        new MeshBasicMaterial({color: color}),
        this.tilesByType[i].length,
      );
      for (let j = 0; j < this.tilesByType[i].length; j++) {
        let tile = this.tilesByType[i][j];
        const rotation = new Matrix4().makeRotationZ(tile.rotation);
        const translation = new Matrix4().makeTranslation(tile.position.x, tile.position.y, 0);
        const matrix = rotation.premultiply(translation);
        im.setMatrixAt(j, matrix);
      }
      im.instanceMatrix.needsUpdate = true;
      this.meshes.push(im);
    }
  }

  override draw(scene: Scene) {
    if (this.dirty) this.updateMeshes();
    scene.add(...this.meshes);
    if (!!this.billiardPath) {
      scene.add(this.billiardPath);
    }
  }

  override play(iterations: number, start: Vector2, direction: number, behavior: boolean) {
    let ray: AffineRay = {
      src: start,
      dir: Complex.polar(1, direction).toVector2(),
    };
    const path: Vector2[] = [start];
    let tile = this.findTileContaining(start);
    for (let i = 0; i < iterations; i++) {
      const p = this.polygonForTile(tile);
      console.log(`Tile Type ${i}: ${tile.tilesetIndex}`);
      let collision: AffinePolygonRayCollision;
      try {
        collision = p.castRay(ray);
        debugger;
        console.log(`Source ${i}: (${ray.src.x}, ${ray.src.y})`);
        console.log(`Direction ${i}: (${ray.dir.x}, ${ray.dir.y})`);
        console.log(`Collision ${i}: (${collision.point.x}, ${collision.point.y})`);
      } catch {
        break;
      }


      for (let v of p.vertices) {
        if (v.distanceTo(collision.point) < EPSILON) throw Error('hit a vertex');
      }

      // This is where the geometric details are implemented. One could perhaps expand on this for some kinds of
      // tilings. In quasi-regular tilings, it's clear what to do, but for a tiling in which multiple copies of
      // the same prototile share edges, two reasonable options suggest themselves:
      //     (1) Do exactly the same thing (i.e., every time you cross an edge, reflect the ray direction in the
      //         line normal to the edge). This is what is currently implemented.
      //     (2) Assign each prototile a (possibly negative) refractive index, and compute the new direction using
      //         Snell's Law. This would mean that the ray would proceed through same-tile edges unbent.

      let si = collision.sideIndex;
      const edge = p.vertices[(si + 1) % p.n].clone().sub(p.vertices[si]);
      // const reflected = ray.dir.clone().sub(project(ray.dir, edge).multiplyScalar(2)).normalize();

      let alpha = Math.acos(Math.abs(ray.dir.clone().dot(edge)) / (ray.dir.length() * edge.length()));
      console.log(`Alpha ${i}: ${(360 * alpha) / (2 * Math.PI)}`);
      let theta1 = (Math.PI / 2) - alpha;
      console.log(`ThetaOne ${i}: ${(360 * theta1) / (2 * Math.PI)}`);

      // Snell's law
      let adj = this.adjacentTile(tile, si);
      let theta2 = Math.asin((Math.sin(theta1) * this.tileset[tile.tilesetIndex].refractiveIndex) / this.tileset[adj.tilesetIndex].refractiveIndex);
      console.log(`ThetaTwo ${i}: ${(360 * theta2) / (2 * Math.PI)}`);

      // ternary
      const reflected = behavior ? ray.dir.clone().sub(project(ray.dir, edge).multiplyScalar(2)).normalize() :
        ray.dir.clone().rotateAround(new Vector2, theta1 - Math.abs(theta2)).multiplyScalar(2).normalize();


      // It is helpful for numerical reasons to push the new ray source a little ways into the new tile. This has
      // a minute chance of causing errors close to vertices, but *shrug*.
      ray = {
        src: collision.point.add(reflected.clone().multiplyScalar(EPSILON * EPSILON)),
        dir: reflected
      };
      path.push(collision.point);


      tile = this.adjacentTile(tile, si);
      this.addTile(tile);
    }
    this.billiardPath = new Line(new BufferGeometry().setFromPoints(path), new LineBasicMaterial({color: 0x000000}));
  }

  private findTileContaining(point: Vector2): T {
    for (let t of this.tiles) {
      if (this.polygonForTile(t).contains(point)) return t;
    }
    throw Error('point is not contained in any tile');
  }

  private polygonForTile(t: T): AffinePolygon {
    let p = this.tileset[t.tilesetIndex].polygon;
    return p.rotate(t.rotation).translate(t.position);
  }
}

// Project u onto v: (u.v/v.v) v
function project(u: Vector2, v: Vector2) {
  return v.clone().multiplyScalar(u.dot(v) / v.dot(v));
}
