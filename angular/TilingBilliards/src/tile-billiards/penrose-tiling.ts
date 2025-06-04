import {GridLineIndex, PenroseTile} from './penrose-tile';
import {AffinePolygon} from './affine-polygon';
import {Color, Vector2} from 'three';
import {AffinePolygonalTiling} from './affine-polygonal-tiling';
import {Line} from '../math/geometry/line';
import {closeEnough} from '../math/math-helpers';

export class PenroseTiling extends AffinePolygonalTiling<PenroseTile> {

  constructor(readonly c: number[], ri1: number, ri2: number) {
    const z1 = (Math.cos(3 * Math.PI / 10) * Math.sin(2 * Math.PI / 5)) / (2 * Math.sin(3 * Math.PI / 10));
    const t1 = (Math.sin(3 * Math.PI / 10) * Math.sin(2 * Math.PI / 5)) / (2 * Math.sin(3 * Math.PI / 10));
    const z2 = (Math.cos(2 * Math.PI / 5) * Math.sin(Math.PI / 5)) / (2 * Math.sin(2 * Math.PI / 5));
    const t2 = (Math.sin(2 * Math.PI / 5) * Math.sin(Math.PI / 5)) / (2 * Math.sin(2 * Math.PI / 5));

    // Vertex coordinates based off of rhomb centroid at the origin
    super([
      {
        polygon: new AffinePolygon([new Vector2(z1 - 1, -t1), new Vector2(z1, -t1),
          new Vector2(z1 + Math.cos(2 * Math.PI / 5), Math.sin(2 * Math.PI / 5) - t1),
          new Vector2(z1 + Math.cos(2 * Math.PI / 5) - 1, Math.sin(2 * Math.PI / 5) - t1)]),
        color: new Color(0xffa500),
        refractiveIndex: ri1
      },
      {
        polygon: new AffinePolygon([new Vector2(z2 - 1, -t2), new Vector2(z2, -t2),
          new Vector2(z2 + Math.cos(Math.PI / 5), Math.sin(Math.PI / 5) - t2),
          new Vector2(z2 + Math.cos(Math.PI / 5) - 1, Math.sin(Math.PI / 5) - t2)]),
        color: new Color(0x00ffff),
        refractiveIndex: ri2
      }
    ])
  }

  defineLine(l: GridLineIndex): Line {
    const angle = l.family * (2 * Math.PI / 5);
    const direction = new Vector2(Math.cos(angle), Math.sin(angle));
    return new Line(direction.x, direction.y, -(this.c[l.family] + l.member));
  }

  getIntersection(l1: GridLineIndex, l2: GridLineIndex): Vector2 {
    return (this.defineLine(l1).intersectLine(this.defineLine(l2))).toVector2();
  }

  /**
   * Method that determines the type of rhomb tile to place at a specified intersection on the reference
   * pentagrid via grid line indices
   * @param l1 - first grid line forming intersection on reference pentagrid
   * @param l2 - second grid line forming intersection on reference pentagrid
   */
  rhombusType(l1: GridLineIndex, l2: GridLineIndex): number {
    const modValue = Math.abs(l2.family - l1.family) % 5;
    return (modValue == 2 || modValue == 3) ? 1 : 0;
  }

  /**
   * Method that determines the rotation angle of a rhomb tile at a specified intersection on the reference
   * pentagrid via grid line indices
   * @param l1 - first grid line forming intersection on reference pentagrid
   * @param l2 - second grid line forming intersection on reference pentagrid
   */
  rhombusRotation(l1: GridLineIndex, l2: GridLineIndex): number {
    return (this.rhombusType(l1, l2) == 0) ? ((l1.family + l2.family - 1) % 5) * (Math.PI / 5) :
      ((l1.family + l2.family - 3) % 5) * (Math.PI / 5);
  }

  /**
   * Method that finds a member index for a family f that intersects with the grid line being moved along
   * @param tileIntersection - point of intersection where original tile is from
   * @param normalDir - normal vector that falls on the lineOn indicating the direction of movement
   * @param familyIndex - index of family f
   * @param lineOn - the grid line being moved along
   * @param lineCrossing - the grid line that is not being moved along
   */
  findMemberIndex(tileIntersection: Vector2, normalDir: Vector2, familyIndex: number, lineOn: GridLineIndex, lineCrossing: GridLineIndex): number {
    let zeroMI = this.getIntersection({family: familyIndex, member: 0}, lineOn);  // 0th line member of family f
    let oneMI = this.getIntersection({family: familyIndex, member: 1}, lineOn);   // 1st line member of family f

    let l = oneMI.clone().sub(zeroMI);  // unit of distance of consecutive intersections for family f and the line we are on
    let v = tileIntersection.clone().sub(zeroMI);
    let distanceSigned = v.dot(l) / l.dot(l);   // scalar coefficient of projecting v onto l (find v 'in terms of l')
    let directionSign = normalDir.dot(l);

    if (familyIndex == lineCrossing.family) {
      return lineCrossing.member + Math.sign(directionSign);
    }

    // Return computed member index
    if (Math.sign(directionSign) == 1) {
      return Math.ceil(distanceSigned);
    } else if (Math.sign(directionSign) == -1) {
      return Math.floor(distanceSigned);
    } else {
      throw Error('We cannot find member index!');
    }
  }

  /**
   * Method that finds the next/closest intersection on the reference pentagrid to the current
   * intersection given the direction we are moving alone a chosen grid line
   * @param lineOn - the grid line being moved along
   * @param lineCrossing - the grid line not being moved along
   * @param normalDir - normal vector that falls on the lineOn indicating the direction of movement
   */
  findNextIntersection(lineOn: GridLineIndex, lineCrossing: GridLineIndex, normalDir: Vector2): GridLineIndex {
    let bestIntersection: GridLineIndex | undefined = undefined;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 1; i < 5; i++) {
      let f = (lineOn.family + i) % 5;
      let m = this.findMemberIndex(this.getIntersection(lineOn, lineCrossing), normalDir,
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
    let normal = this.tileset[t.tilesetIndex].polygon.sideNormal(sideIndex).rotateAround(new Vector2(), t.rotation);

    if (this.defineLine(t.gridLineIndex1).containsVector(normal)) {
      next = this.findNextIntersection(t.gridLineIndex1, t.gridLineIndex2, normal);
      lineOn = t.gridLineIndex1;
    } else if (this.defineLine(t.gridLineIndex2).containsVector(normal)) {
      next = this.findNextIntersection(t.gridLineIndex2, t.gridLineIndex1, normal);
      lineOn = t.gridLineIndex2;
    } else {
      throw Error('We do not find the normal on either line.')
    }

    let adjType = this.rhombusType(lineOn, next);
    let adjRotation = this.rhombusRotation(lineOn, next)
    return new PenroseTile(adjType,
      t.position.clone().add(this.displacement(t, adjType, adjRotation, normal, sideIndex)), adjRotation, lineOn, next);
  }

  /**
   * Method that finds vector displacement from the current tile position to place an adjacent tile
   * @param current - the current tile we are finding adjacent tiles to
   * @param adjType - the type of adjacent tile on a given side (index) of the current tile
   * @param adjRotation - the rotation of an adjacent tile on a given side (index) of the current tile
   * @param normal - the normal vector to a specified side of the current tile
   * @param sideIndex - the specified side of the current tile
   */
  displacement(current: PenroseTile, adjType: number, adjRotation: number, normal: Vector2, sideIndex: number): Vector2 {
    let oldTile = this.tileset[current.tilesetIndex].polygon.rotate(current.rotation);
    let newTile = this.tileset[adjType].polygon.rotate(adjRotation);

    for (let i = 0; i < newTile.n; i++) {
      if (closeEnough(newTile.sideNormal(i).dot(normal), -1)) {
        let oldMidpoint = oldTile.sideMidpoint(sideIndex);
        let newMidpoint = newTile.sideMidpoint(i);

        return (oldMidpoint.sub(newMidpoint));
      }
    }
    throw Error('We do not return midpoints!');
  }

  firstTile(): PenroseTile {
    let gl1 = {family: 0, member: 0};
    let gl2 = {family: 1, member: 0};
    const position = this.getIntersection(gl1, gl2);

    return new PenroseTile(this.rhombusType(gl1, gl2), new Vector2(position.x, position.y), this.rhombusRotation(gl1, gl2),
      gl1, gl2);
  }
}

