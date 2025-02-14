import {PolygonalTiling} from './polygonal-tiling';
import {PenroseTile} from './penrose-tile';
import {AffinePolygon} from './affine-polygon';
import {Color, Scene, Vector2} from 'three';
import {AffinePolygonalTiling} from './affine-polygonal-tiling';
import {Line} from '../math/geometry/line';
import {Complex} from '../math/complex';

export class PenroseTiling extends AffinePolygonalTiling<PenroseTile> {

  constructor() {
    // TODO create indices of rhombi (both thick and thin) to draw on the screen - DONE
    // polygon: AffinePolygon.regular(4,1) - used to confirm a polygon drawn to the screen

    const z1 = (Math.cos(3 * Math.PI / 10) * Math.sin(2 * Math.PI / 5)) / (2 * Math.sin(3 * Math.PI / 10));
    const t1 = (Math.sin(3 * Math.PI / 10) * Math.sin(2 * Math.PI / 5)) / (2 * Math.sin(3 * Math.PI / 10));
    const z2 = (Math.cos(2 * Math.PI / 5) * Math.sin(Math.PI / 5)) / (2 * Math.sin(2 * Math.PI / 5));
    const t2 = (Math.sin(2 * Math.PI / 5) * Math.sin(Math.PI / 5)) / (2 * Math.sin(2 * Math.PI / 5));

    super([{polygon: AffinePolygon.regular(4, 1), color: new Color(0x444444)}]);
  }
    /*
    super([
      {polygon: new AffinePolygon([new Vector2(z1-1,-t1), new Vector2(z1,-t1),
        new Vector2(z1+Math.cos(2*Math.PI/5),Math.sin(2*Math.PI/5)-t1),
        new Vector2(z1+Math.cos(2*Math.PI/5)-1,Math.sin(2*Math.PI/5)-t1)]),
      color: new Color(0x444444)},

      {polygon: new AffinePolygon([new Vector2(z2-1,-t2), new Vector2(z2,-t2),
          new Vector2(z2+Math.cos(Math.PI/5),Math.sin(Math.PI/5)-t2),
          new Vector2(z2+Math.cos(Math.PI/5)-1,Math.sin(Math.PI/5)-t2)]),
        color: new Color(0x444444)}
    ])
  }
  */

  /*
  Going to write a method that defines a line in a family specified by the family and member tags
   */

  defineLine(family: number, member: number): Line {

    const angle = family * (2*Math.PI/5);
    const direction = new Complex(Math.cos(angle), Math.sin(angle));
    const offsetSpacing = member * 0.5;
    const source = new Complex(offsetSpacing+Math.cos(angle), offsetSpacing+Math.sin(angle));

    console.log(`Generating Line - Family: ${family}, Member: ${member}`);
    console.log(`Direction: (${direction.x},${direction.y}), Source: (${source.x},${source.y})`);

    return Line.srcDir(source,direction);   // Call to the
  }

  /*
  Going to write method that finds the intersection between two lines
   */

  getIntersection(family1: number, member1: number, family2: number, member2: number): Complex {

    const line1 = this.defineLine(family1, member1);
    console.log(`Line 1 Parameters: (a - ${line1.a}, b - ${line1.b}, c - ${line1.c})`);

    const line2 = this.defineLine(family2, member2);
    console.log(`Line 2 Parameters: (a - ${line2.a}, b - ${line2.b}, c - ${line2.c})`);

    const intersection = line1.intersectLine(line2);

    console.log(`Intersection at: (${intersection.x},${intersection.y})`);

    return intersection;
  }

  adjacentTile(t: PenroseTile, sideIndex: number): PenroseTile {
    return this.firstTile();  // - this was used to return just the first tile

    /*
        changed to this.tiling.generate(2) in resetTiling() withing tiling-billiards-component to
        draw both the tiles: thick rhombus and thin rhombus
    */
    // return new PenroseTile(1, new Vector2(0,-1),0,{family: 0, member:1},{family: 1, member:1})
  }

  firstTile(): PenroseTile {

    /*
      changed to this.tiling.generate(1) in resetTiling() withing tiling-billiards-component to
      test drawing a polygon/thick rhomb at an intersection point
    */

    const positionPoint = this.getIntersection(4,2,1,2)

    console.log(`First Tile position: (${positionPoint.x}, ${positionPoint.y})`);
    return new PenroseTile(0,new Vector2(positionPoint.x, positionPoint.y),0,{family: 1, member: 2}, {family: 2, member: 1});

  }


}

