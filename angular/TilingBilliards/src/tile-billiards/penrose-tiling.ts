import {PolygonalTiling} from './polygonal-tiling';
import {PenroseTile} from './penrose-tile';
import {AffinePolygon} from './affine-polygon';
import {Color, Scene, Vector2} from 'three';
import {AffinePolygonalTiling} from './affine-polygonal-tiling';

export class PenroseTiling extends AffinePolygonalTiling<PenroseTile> {

  constructor() {
    // TODO create indices of rhombi (both thick and thin) to draw on the screen - DONE
    // polygon: AffinePolygon.regular(4,1) - used to confirm a polygon drawn to the screen

    const z1 = (Math.cos(3*Math.PI/10)*Math.sin(2*Math.PI/5))/(2*Math.sin(3*Math.PI/10));
    const t1 = (Math.sin(3*Math.PI/10)*Math.sin(2*Math.PI/5))/(2*Math.sin(3*Math.PI/10));
    const z2 = (Math.cos(2*Math.PI/5)*Math.sin(Math.PI/5))/(2*Math.sin(2*Math.PI/5));
    const t2 = (Math.sin(2*Math.PI/5)*Math.sin(Math.PI/5))/(2*Math.sin(2*Math.PI/5));

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

  adjacentTile(t: PenroseTile, sideIndex: number): PenroseTile {
    // return this.firstTile();  - this was used to return just the first tile
    /*
        changed to this.tiling.generate(2) in resetTiling() withing tiling-billiards-component to
        draw both the tiles: thick rhombus and thin rhombus
    */
    return new PenroseTile(1, new Vector2(0,-1),0,{family: 0, member:1},{family: 1, member:1})
  }

  firstTile(): PenroseTile {

    return new PenroseTile(0,new Vector2(),0,{family: 0, member: 0}, {family: 1, member: 0});

  }


}

