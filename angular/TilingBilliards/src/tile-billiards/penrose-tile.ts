import {Tile} from './tile';
import {AffineTile} from './affine-tile';
import {Vector2} from 'three';

export interface GridLineIndex {
  family: number;
  member: number;
}

export class PenroseTile extends AffineTile {
  gridLineIndex1: GridLineIndex;
  gridLineIndex2: GridLineIndex;

  constructor(prototileIndex: number, position: Vector2, rotation: number, gridLineIndex1: GridLineIndex, gridLineIndex2: GridLineIndex) {
    super(prototileIndex, position, rotation);

    this.gridLineIndex1 = gridLineIndex1;
    this.gridLineIndex2 = gridLineIndex2;

  }

}
