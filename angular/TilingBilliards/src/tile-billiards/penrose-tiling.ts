import {GridLineIndex, PenroseTile} from './penrose-tile';
import {AffinePolygon} from './affine-polygon';
import {Color, Vector2} from 'three';
import {AffinePolygonalTiling} from './affine-polygonal-tiling';
import {Line} from '../math/geometry/line';
import {closeEnough} from '../math/math-helpers';

export class PenroseTiling extends AffinePolygonalTiling<PenroseTile> {

  constructor(readonly c: number[]) {
    const z1 = (Math.cos(3 * Math.PI / 10) * Math.sin(2 * Math.PI / 5)) / (2 * Math.sin(3 * Math.PI / 10));
    const t1 = (Math.sin(3 * Math.PI / 10) * Math.sin(2 * Math.PI / 5)) / (2 * Math.sin(3 * Math.PI / 10));
    const z2 = (Math.cos(2 * Math.PI / 5) * Math.sin(Math.PI / 5)) / (2 * Math.sin(2 * Math.PI / 5));
    const t2 = (Math.sin(2 * Math.PI / 5) * Math.sin(Math.PI / 5)) / (2 * Math.sin(2 * Math.PI / 5));

    super([
      {
        polygon: new AffinePolygon([new Vector2(z1 - 1, -t1), new Vector2(z1, -t1),
          new Vector2(z1 + Math.cos(2 * Math.PI / 5), Math.sin(2 * Math.PI / 5) - t1),
          new Vector2(z1 + Math.cos(2 * Math.PI / 5) - 1, Math.sin(2 * Math.PI / 5) - t1)]),
        color: new Color(0xffa500),
        refractiveIndex: 1
      },
      {
        polygon: new AffinePolygon([new Vector2(z2 - 1, -t2), new Vector2(z2, -t2),
          new Vector2(z2 + Math.cos(Math.PI / 5), Math.sin(Math.PI / 5) - t2),
          new Vector2(z2 + Math.cos(Math.PI / 5) - 1, Math.sin(Math.PI / 5) - t2)]),
        color: new Color(0x00ffff),
        refractiveIndex: -1
      }
    ])
  }

  /*
  Going to write a method that defines a line in a family specified by the family and member tags
   */
  defineLine(l: GridLineIndex): Line {

    const angle = l.family * (2 * Math.PI / 5);
    const direction = new Vector2(Math.cos(angle), Math.sin(angle));

    return new Line(direction.x, direction.y, -(this.c[l.family] + l.member));
  }

  /*
  Going to write method that finds the intersection between two lines
   */
  getIntersection(l1: GridLineIndex, l2: GridLineIndex): Vector2 {

    const line1 = this.defineLine(l1);
    const line2 = this.defineLine(l2);
    const intersection = line1.intersectLine(line2);
    return intersection.toVector2(); // toVector2();
  }

  /*
  Method that determines the type of rhomb tile to place based on intersection angles
   */
  rhombusType(l1: GridLineIndex, l2: GridLineIndex): number {

    const modValue = Math.abs(l2.family - l1.family) % 5;
    if (modValue == 2 || modValue == 3)
      return 1;
    else
      return 0;
  }

  // TODO: At some point, adjust this method to some sort of combinatorial formula using family indices
  rhombusRotation(l1: GridLineIndex, l2: GridLineIndex): number {
    let angleRotation = 0;

    if ((l1.family == 1 && l2.family == 2) || (l1.family == 2 && l2.family == 1) ||
      (l1.family == 1 && l2.family == 4) || (l1.family == 4 && l2.family == 1)) {
      angleRotation = 2 * Math.PI / 5;
    } else if ((l1.family == 1 && l2.family == 3) || (l1.family == 3 && l2.family == 1) ||
      (l1.family == 3 && l2.family == 4) || (l1.family == 4 && l2.family == 3)) {
      angleRotation = Math.PI / 5;
    } else if ((l1.family == 0 && l2.family == 4) || (l1.family == 4 && l2.family == 0) ||
      (l1.family == 2 && l2.family == 4) || (l1.family == 4 && l2.family == 2)) {
      angleRotation = 3 * Math.PI / 5;
    } else if ((l1.family == 0 && l2.family == 2) || (l1.family == 2 && l2.family == 0)) {
      angleRotation = 4 * Math.PI / 5;
    } else if ((l1.family == 2 && l2.family == 3) || (l1.family == 3 && l2.family == 2)) {
      angleRotation = 4 * Math.PI / 5;
    }
    return angleRotation;
  }

  /**
   * Method that finds a member index for a family f that intersects with the line being moved along
   * @param tileIntersection - point of intersection where original tile is from
   * @param direction - normal vector that falls on the lineOn
   * @param familyIndex - index of family f
   * @param lineOn - the line being moved along
   * @param lineCrossing - the line that is not being moved along
   */
  findMemberIndex(tileIntersection: Vector2, direction: Vector2, familyIndex: number, lineOn: GridLineIndex, lineCrossing: GridLineIndex): number {
    let memberIndex = 0;
    let zeroMemberIntersection = this.getIntersection({family: familyIndex, member: 0}, lineOn);
    let oneMemberIntersection = this.getIntersection({family: familyIndex, member: 1}, lineOn);
    let l = oneMemberIntersection.clone().sub(zeroMemberIntersection);
    let v = tileIntersection.clone().sub(zeroMemberIntersection);
    let distanceSigned = v.dot(l) / l.dot(l);
    let directionSigned = direction.dot(l);

    if (familyIndex == lineCrossing.family) {
      return lineCrossing.member + Math.sign(directionSigned);
    }

    if (Math.sign(directionSigned) == 1) {
      memberIndex = Math.ceil(distanceSigned);
    } else if (Math.sign(directionSigned) == -1) {
      memberIndex = Math.floor(distanceSigned);
    } else {
      throw Error('We cannot find member index!');
    }
    return memberIndex;
  }

  findNextIntersection(lineOn: GridLineIndex, lineCrossing: GridLineIndex, direction: Vector2): GridLineIndex {
    let bestIntersection: GridLineIndex | undefined = undefined;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 1; i < 5; i++) {
      let f = (lineOn.family + i) % 5;
      let m = this.findMemberIndex(this.getIntersection(lineOn, lineCrossing), direction,
        f, lineOn, lineCrossing);
      let d = this.getIntersection(lineOn, lineCrossing).distanceTo(this.getIntersection(lineOn, {
        family: f,
        member: m
      }));

      if (d < bestDistance) {
        bestDistance = d;
        bestIntersection = {family: f, member: m};
      }
    }

    if (bestIntersection == undefined) {
      throw Error('We did not find a best intersection!');
    }
    return bestIntersection;
  }

  adjacentTile(t: PenroseTile, sideIndex: number): PenroseTile {
    let next: GridLineIndex;
    let lineOn: GridLineIndex;
    let normalVector = this.tileset[t.tilesetIndex].polygon.sideNormal(sideIndex).rotateAround(new Vector2(), t.rotation); //t.rotation

    if (this.defineLine(t.gridLineIndex1).containsVector(normalVector)) {
      next = this.findNextIntersection(t.gridLineIndex1, t.gridLineIndex2, normalVector);
      lineOn = t.gridLineIndex1;
    } else if (this.defineLine(t.gridLineIndex2).containsVector(normalVector)) {
      next = this.findNextIntersection(t.gridLineIndex2, t.gridLineIndex1, normalVector);
      lineOn = t.gridLineIndex2;
    } else {
      throw Error('We do not find the normal on either line.')
    }

    let type = this.rhombusType(lineOn, next);
    let rotation = this.rhombusRotation(lineOn, next);
    return new PenroseTile(type,
      t.position.clone().add(this.displacement(t, type, rotation, normalVector, sideIndex)), rotation, lineOn, next);
  }

  /* override draw(scene: Scene) {
    let colors: number[] = [0xff0000, 0x00ff00, 0x00bfff, 0xff00ff, 0xffff00];
    let circle = new AffineCircle(Complex.ZERO, 1000);

    for (let i = 0; i < 5; i++) {
      let values: Vector2[] = [];
      for (let j = -100; j < 100; j++) {
        let line = this.defineLine({family: i, member: j});
        let intersection = circle.intersectLine(line);

        values.push(intersection[0].toVector2());
        values.push(intersection[1].toVector2());
      }

      let lineSegments = new LineSegments(
        new BufferGeometry().setFromPoints(values), new LineBasicMaterial({color: colors[i]}));
      scene.add(lineSegments);
    }
    super.draw(scene);
  } */

  displacement(tile: PenroseTile, tileType2: number, rotation2: number, direction: Vector2, sideIndex: number): Vector2 {
    let oldTile = this.tileset[tile.tilesetIndex].polygon.rotate(tile.rotation);
    let newTile = this.tileset[tileType2].polygon.rotate(rotation2);

    for (let i = 0; i < newTile.n; i++) {
      if (closeEnough(newTile.sideNormal(i).dot(direction), -1)) {
        let oldMipoint = oldTile.sideMidpoint(sideIndex);
        let newMidpoint = newTile.sideMidpoint(i);

        return (oldMipoint.sub(newMidpoint));
      }
    }
    throw Error('We do not return midpoints!');
  }

  /* override generate(depth: number) {

    for(let family1 = 0; family1 < 4; family1++) {
      for(let family2 = family1 + 1; family2 < 5; family2++) {
        for(let member1 = -depth; member1 <= depth; member1++) {
          for(let member2 = -depth; member2 <= depth; member2++) {
            let gl1: GridLineIndex = {family: family1, member: member1};
            let gl2: GridLineIndex = {family: family2, member: member2};

            this.addTile(new PenroseTile(this.rhombusType(gl1,gl2), this.getIntersection(gl1,gl2),
              this.rhombusRotation(gl1,gl2), gl1, gl2));
          }
        }
      }
    }
  } */

  firstTile(): PenroseTile {
    let gl1 = {family: 0, member: 0}; // 0 0
    let gl2 = {family: 1, member: 0}; // 4 2
    const positionPoint = this.getIntersection(gl1, gl2);

    return new PenroseTile(this.rhombusType(gl1, gl2), new Vector2(positionPoint.x, positionPoint.y), this.rhombusRotation(gl1, gl2),
      gl1, gl2);
  }
}

