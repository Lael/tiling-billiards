import {PolygonalTiling} from './polygonal-tiling';
import {PenroseTile} from './penrose-tile';
import {AffinePolygon} from './affine-polygon';
import {Color, Scene, Vector2} from 'three';
import {AffinePolygonalTiling} from './affine-polygonal-tiling';

export class PenroseTiling extends AffinePolygonalTiling<PenroseTile> {

  constructor() {
    // TODO create indices of rhombus (both thick and thin) to show on the screen
    // polygon: AffinePolygon.regular(4,1)

    const z = (Math.cos(3*Math.PI/10)*Math.sin(2*Math.PI/5))/(2*Math.sin(3*Math.PI/10));
    const t = (Math.sin(3*Math.PI/10)*Math.sin(2*Math.PI/5))/(2*Math.sin(3*Math.PI/10));

    super([{polygon: new AffinePolygon([new Vector2(z-1,-t), new Vector2(z,-t),
        new Vector2(z+Math.cos(2*Math.PI/5),Math.sin(2*Math.PI/5)-t),
        new Vector2(z+Math.cos(2*Math.PI/5)-1,Math.sin(2*Math.PI/5)-t)]),
      color: new Color(0x444444)}])
  }


  adjacentTile(t: PenroseTile, sideIndex: number): PenroseTile {
    return this.firstTile();
  }

  firstTile(): PenroseTile {

    return new PenroseTile(0,new Vector2(),0,{family: 0, member: 0}, {family: 1, member: 0});

  }


}

