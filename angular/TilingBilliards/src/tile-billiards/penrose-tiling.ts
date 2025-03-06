import {PolygonalTiling} from './polygonal-tiling';
import {GridLineIndex, PenroseTile} from './penrose-tile';
import {AffinePolygon} from './affine-polygon';
import {BufferGeometry, Color, LineBasicMaterial, LineSegments, Scene, Vector2} from 'three';
import {AffinePolygonalTiling} from './affine-polygonal-tiling';
import {Line} from '../math/geometry/line';
import {Complex} from '../math/complex';
import {AffineCircle} from '../math/geometry/affine-circle';
import {log} from 'node:util';

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
    const direction = new Vector2(Math.cos(angle), Math.sin(angle));

    //const offsetSpacing = member * 0.5;
    //const source = new Complex(offsetSpacing+Math.cos(angle), offsetSpacing+Math.sin(angle));

    //console.log(`Generating Line - Family: ${l.family}, Member: ${l.member}`);
    //console.log(`Direction: (${direction.x},${direction.y}), Source: (${source.x},${source.y})`);

    //console.log(`Line Parameters: (a - ${direction.x}, b - ${direction.y}, c - ${this.c[l.family]+l.member})`);

    return new Line(direction.x,direction.y,-(this.c[l.family]+l.member));   // Call to the
  }

  /*
  Going to write method that finds the intersection between two lines
   */

  getIntersection(l1: GridLineIndex, l2: GridLineIndex): Vector2 {

    const line1 = this.defineLine(l1);
    // console.log(`Line 1 Parameters: (a - ${line1.a}, b - ${line1.b}, c - ${line1.c})`);

    const line2 = this.defineLine(l2);
    // console.log(`Line 2 Parameters: (a - ${line2.a}, b - ${ line2.b}, c - ${line2.c})`);

    const intersection = line1.intersectLine(line2);
    // console.log(`Intersection at: (${intersection.x},${intersection.y})`);

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



  lineContainsTranslatedPoint(testLine: Line, translatedPoint: Vector2):boolean {

    let contains  = false;

    let RHS = -testLine.c     // negate c to adjust for negative intersection output
    let LHS = testLine.a*translatedPoint.x + testLine.b*translatedPoint.y;

    console.log(`LHS: ${LHS}, RHS : ${RHS}`); // debug

    if (Math.abs(LHS-RHS) < 1e-6) {   // can have miniscule differences due to round off error in computations

       contains = true;
    }

    return contains;
  }

  findDistanceInTermsOfL(distance: number, L: number): number {

    return distance/L;
  }

  findMemberIndex(tileIntersection: Vector2, direction: Vector2,
                  familyIndex: number , lineOn: GridLineIndex, lineCrossing: GridLineIndex): number {

    //debug

    console.log(`Line On Family: ${lineOn.family} Finding Member of Family: ${familyIndex}`);

    let memberIndex = 0;


    // Find intersection at the given familyIndex's 0th member and the line we are on!

    let zeroMemberIntersection = this.getIntersection({family: familyIndex, member: 0}, lineOn);
    let oneMemberIntersection = this.getIntersection({family: familyIndex, member: 1}, lineOn);


    let l = oneMemberIntersection.clone().sub(zeroMemberIntersection);

    let v = tileIntersection.clone().sub(zeroMemberIntersection);


    let distanceSigned = v.dot(l) / l.dot(l);

    let directionSigned = direction.dot(l);

    if (familyIndex == lineCrossing.family){

      return lineCrossing.member + Math.sign(directionSigned);
    }

    if (Math.sign(directionSigned) == 1) {

      memberIndex = Math.ceil(distanceSigned);

    } else if (Math.sign(directionSigned) == -1) {

      memberIndex = Math.floor(distanceSigned);

    } else {

      throw Error ('We cannot find member index!');
    }



      // debug
    // this.addTile(new PenroseTile(this.rhombusType(lineON,{family: familyIndex, member: 0}),
      //this.getIntersection(lineON,{family: familyIndex, member: memberIndex}),
      //this.rhombusRotation(lineON,{family: familyIndex, member: memberIndex}),
      //lineON, {family: familyIndex, member: memberIndex}))




    console.log(`Tile Added at Line On Family: ${lineOn.family}, Member: ${lineOn.member}
    AND Family: ${familyIndex}, Member: ${memberIndex} AT POINT: (${this.getIntersection(lineOn,
      {family: familyIndex, member: memberIndex}).x}, ${this.getIntersection(lineOn,
      {family: familyIndex, member: memberIndex}).y}` );

      console.log(`Member Index: ${memberIndex}`);

    return memberIndex;
  }




  findNextIntersection(lineOn: GridLineIndex, lineCrossing: GridLineIndex, direction: Vector2): GridLineIndex {
  // make return GridLineIndex

    // debugger;

    let bestIntersection: GridLineIndex | undefined = undefined;
    let bestDistance = Number.POSITIVE_INFINITY;

      // TODO find a way to cycle through the four families - mod5 - DONE


      for (let i = 1; i < 5; i++) {

        let f = (lineOn.family + i) % 5;

        let m = this.findMemberIndex(this.getIntersection(lineOn, lineCrossing), direction,
           f, lineOn, lineCrossing);

        let d = this.getIntersection(lineOn,lineCrossing).distanceTo(this.getIntersection(lineOn, {family:f, member: m}));

        if (d < bestDistance) {

          bestDistance = d;
          bestIntersection = {family: f, member: m};
        }
      }

      if (bestIntersection == undefined){

        throw Error('We did not find a best intersection!');
      }

      // TODO create method to find distance ito L, use the ceiling/floor property then and output member indices
      // TODO then compute euclidean distances once we have GLIs, then return out that GLI!

    // Will return a GLI in the future, we just have this for debugging purposes right now

    return bestIntersection;
  }


  adjacentTile(t: PenroseTile, sideIndex: number): PenroseTile {

    // Attach side indices and tile, choose the line we are moving along and then the direction

    /*
        changed to this.tiling.generate(2) in resetTiling() withing tiling-billiards-component
    */

    let next: GridLineIndex;
    let lineOn: GridLineIndex;

    console.log(`Side Index: ${sideIndex}`);

    let normalVector = this.tileset[t.tilesetIndex].polygon.sideNormal(sideIndex).rotateAround(new Vector2(), t.rotation);

    if (this.defineLine(t.gridLineIndex1).containsVector(normalVector)) {
      next = this.findNextIntersection(t.gridLineIndex1, t.gridLineIndex2, normalVector);
      lineOn = t.gridLineIndex1;
    } else if (this.defineLine(t.gridLineIndex2).containsVector(normalVector)) {
      next = this.findNextIntersection(t.gridLineIndex2, t.gridLineIndex1, normalVector);
      lineOn = t.gridLineIndex2;
    } else {
      debugger;
      throw Error('We do not find the normal on either line.')
    }

    console.log(`Normal Vector: (${normalVector.x},${normalVector.y})`);




    // Will return a Penrose tile at some point

    return new PenroseTile(this.rhombusType(lineOn, next), this.getIntersection(lineOn, next), this.rhombusRotation(lineOn, next),
      lineOn, next);
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

    let gl1 = {family: 0, member: 0};
    let gl2 = {family: 4, member: 2};

    console.log(`First Tile START`);  // debug

    const positionPoint = this.getIntersection(gl1,gl2);

    console.log(`First Tile position: (${positionPoint.x}, ${positionPoint.y})`);   // debug

    console.log(`First Tile END`);    // debug



    return new PenroseTile(this.rhombusType(gl1, gl2),
      new Vector2(positionPoint.x, positionPoint.y),
      this.rhombusRotation(gl1, gl2),
      gl1, gl2);

  }


}

