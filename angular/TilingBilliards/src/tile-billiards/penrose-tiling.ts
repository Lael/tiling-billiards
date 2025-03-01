import {PolygonalTiling} from './polygonal-tiling';
import {GridLineIndex, PenroseTile} from './penrose-tile';
import {AffinePolygon} from './affine-polygon';
import {BufferGeometry, Color, LineBasicMaterial, LineSegments, Scene, Vector2} from 'three';
import {AffinePolygonalTiling} from './affine-polygonal-tiling';
import {Line} from '../math/geometry/line';
import {Complex} from '../math/complex';
import {AffineCircle} from '../math/geometry/affine-circle';

export class PenroseTiling extends AffinePolygonalTiling<PenroseTile> {

  constructor(readonly c: number[]) {
    // TODO create indices of rhombi (both thick and thin) to draw on the screen - DONE
    // polygon: AffinePolygon.regular(4,1) - used to confirm a polygon drawn to the screen

    const z1 = (Math.cos(3 * Math.PI / 10) * Math.sin(2 * Math.PI / 5)) / (2 * Math.sin(3 * Math.PI / 10));
    const t1 = (Math.sin(3 * Math.PI / 10) * Math.sin(2 * Math.PI / 5)) / (2 * Math.sin(3 * Math.PI / 10));
    const z2 = (Math.cos(2 * Math.PI / 5) * Math.sin(Math.PI / 5)) / (2 * Math.sin(2 * Math.PI / 5));
    const t2 = (Math.sin(2 * Math.PI / 5) * Math.sin(Math.PI / 5)) / (2 * Math.sin(2 * Math.PI / 5));


    /*
    super([{polygon: AffinePolygon.regular(4, 1), color: new Color(0x444444)}]);

  }
  */
    super([
      {polygon: new AffinePolygon([new Vector2(z1-1,-t1), new Vector2(z1,-t1),
        new Vector2(z1+Math.cos(2*Math.PI/5),Math.sin(2*Math.PI/5)-t1),
        new Vector2(z1+Math.cos(2*Math.PI/5)-1,Math.sin(2*Math.PI/5)-t1)]).scale(0.05),
      color: new Color(0xffa500)},

      {polygon: new AffinePolygon([new Vector2(z2-1,-t2), new Vector2(z2,-t2),
          new Vector2(z2+Math.cos(Math.PI/5),Math.sin(Math.PI/5)-t2),
          new Vector2(z2+Math.cos(Math.PI/5)-1,Math.sin(Math.PI/5)-t2)]).scale(0.05),
        color: new Color(0x00ffff)}
    ])
  }

  /*
  Going to write a method that defines a line in a family specified by the family and member tags
   */

  defineLine(l: GridLineIndex): Line {

    const angle = l.family * (2*Math.PI/5);
    const direction = new Complex(Math.cos(angle), Math.sin(angle));
    //const offsetSpacing = member * 0.5;
    //const source = new Complex(offsetSpacing+Math.cos(angle), offsetSpacing+Math.sin(angle));

    //console.log(`Generating Line - Family: ${family}, Member: ${member}`);
    //console.log(`Direction: (${direction.x},${direction.y}), Source: (${source.x},${source.y})`);

    return new Line(direction.x,direction.y,this.c[l.family]+l.member);   // Call to the
  }

  /*
  Going to write method that finds the intersection between two lines
   */

  getIntersection(l1: GridLineIndex, l2: GridLineIndex): Vector2 {

    const line1 = this.defineLine(l1);
    console.log(`Line 1 Parameters: (a - ${line1.a}, b - ${line1.b}, c - ${line1.c})`);

    const line2 = this.defineLine(l2);
    console.log(`Line 2 Parameters: (a - ${line2.a}, b - ${line2.b}, c - ${line2.c})`);

    const intersection = line1.intersectLine(line2);

    console.log(`Intersection at: (${intersection.x},${intersection.y})`);

    return intersection.toVector2();
  }

  /*
  Method that determines the type of rhomb tile to place based on intersection angles
   */

  rhombusType(l1: GridLineIndex, l2: GridLineIndex): number {

    const modValue = (l2.family - l1.family) % 5;
    if (modValue == 2 || modValue == 3)
      return 1;
    else
      return 0;
  }

  /*
  Method that determines the orientation of the rhomb tile based on the intersection  angles

  TODO: At some point, adjust this method to some sort of combinatorial formula using family indices

  For  the time being, this method works!
   */


  rhombusRotation(l1: GridLineIndex, l2: GridLineIndex): number {

    let angleRotation = 0;

    /*if ((l1.family == 0 && l2.family == 1) || (l1.family == 1 && l2.family == 0) ||
      (l1.family == 0 && l2.family == 3) || (l1.family == 3 && l2.family == 0)) {

      angleRotation = 0;

    } */
    if ((l1.family == 1 && l2.family == 2) || (l1.family == 2 && l2.family == 1) ||
      (l1.family == 1 && l2.family == 4) || (l1.family == 4 && l2.family == 1)) {

      angleRotation = 2*Math.PI/5

    } else if ((l1.family == 1 && l2.family == 3) || (l1.family == 3 && l2.family == 1) ||
      (l1.family == 3 && l2.family == 4) || (l1.family == 4 && l2.family == 3)) {

      angleRotation = Math.PI/5;

    } else if ((l1.family == 0 && l2.family == 4) || (l1.family == 4 && l2.family == 0) ||
      (l1.family == 2 && l2.family == 4) || (l1.family == 4 && l2.family == 2)) {

      angleRotation = 3*Math.PI/5;

    } else if ((l1.family == 0 && l2.family == 2) || (l1.family == 2 && l2.family == 0)) {

      angleRotation = 4*Math.PI/5;

    } else if ((l1.family == 2 && l2.family == 3) || (l1.family == 3 && l2.family == 2)) {

      angleRotation = 3*Math.PI/10;

    }

    return angleRotation;
  }



  findNextIntersection(lineON: GridLineIndex, lineCROSSING: GridLineIndex, direction: Vector2): GridLineIndex {

      let nearestPoint: Vector2;

    return lineON ;
  }


  adjacentTile(t: PenroseTile, sideIndex: number): PenroseTile {
    // return this.firstTile();  // - this was used to return just the first tile
    // Attach side indices and tile, choose the line we are moving along and then the direction

    /*
        changed to this.tiling.generate(2) in resetTiling() withing tiling-billiards-component to
        draw both the tiles: thick rhombus and thin rhombus
    */
    // return new PenroseTile(1, new Vector2(0,-1),0,{family: 0, member:1},{family: 1, member:1})

    console.log(`Side Index: ${sideIndex}`);

    let normalVector = this.tileset[t.tilesetIndex].polygon.sideNormal(sideIndex);

    console.log(`Normal Vector: (${normalVector.x},${normalVector.y})`);

    let nextIntersection = this.findNextIntersection(t.gridLineIndex1, t.gridLineIndex2,
     normalVector);



    // let triangleAngleIndicator = t.tilesetIndex;

    // if triangle

   // let L = 1/(Math.sin());


    //return PenroseTile()

    return this.firstTile();
  }

  override draw(scene: Scene){

    let colors: number[] = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00];
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

    /*
      changed to this.tiling.generate(1) in resetTiling() withing tiling-billiards-component to
      test drawing a polygon/thick rhomb at an intersection point
    */

    const positionPoint = this.getIntersection({family: 0, member: 0},{family: 1, member: 0});

    console.log(`First Tile position: (${positionPoint.x}, ${positionPoint.y})`);



    return new PenroseTile(this.rhombusType({family: 0, member: 0}, {family: 1, member: 0}),
      new Vector2(positionPoint.x, positionPoint.y),
      this.rhombusRotation({family: 0, member: 0}, {family: 1, member: 0}),
      {family: 1, member: 2}, {family: 2, member: 1});

  }


}

