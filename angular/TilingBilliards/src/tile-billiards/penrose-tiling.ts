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

    return new Line(direction.x,direction.y,this.c[l.family]+l.member);   // Call to the
  }

  /*
  Going to write method that finds the intersection between two lines
   */

  getIntersection(l1: GridLineIndex, l2: GridLineIndex): Vector2 {

    const line1 = this.defineLine(l1);
    // console.log(`Line 1 Parameters: (a - ${line1.a}, b - ${line1.b}, c - ${line1.c})`);

    const line2 = this.defineLine(l2);
    // console.log(`Line 2 Parameters: (a - ${line2.a}, b - ${ line2.b}, c - ${line2.c})`);

    const intersection = new Complex(line1.intersectLine(line2).x, line1.intersectLine(line2).y);
    // console.log(`Intersection at: (${intersection.x},${intersection.y})`);

    return intersection.toVector2(); // toVector2();
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

  findMemberIndex(tileIntersection: Vector2, translatedNormalPoint: Vector2, normalPoint: Vector2,
                  angleIndicator: number, familyIndex: number , lineON: GridLineIndex): number {

    //debug

    console.log(`Line On Family: ${lineON.family} Finding Member of Family: ${familyIndex}`);

    let theta = 0;
    let memberIndex = 0;

    if (angleIndicator == 0) {

      theta = 2*Math.PI/5;

    } else if (angleIndicator == 1) {

      theta = Math.PI/5;
    }

    let L = 1/(Math.sin(theta));

    // Find intersection at the given familyIndex's 0th member and the line we are on!

    let zeroMemberIntersection = this.getIntersection({family: familyIndex, member: 0}, lineON);

    // debug
    // this.addTile(new PenroseTile(this.rhombusType(lineON,{family: familyIndex, member: 0}),
      //this.getIntersection(lineON,{family: familyIndex, member: memberIndex}),
      //this.rhombusRotation(lineON,{family: familyIndex, member: memberIndex}),
      //lineON, {family: familyIndex, member: memberIndex}))

    let distanceTileToZeroMember = Math.hypot(tileIntersection.x - zeroMemberIntersection.x,
      tileIntersection.y - zeroMemberIntersection.y);
    console.log(`Distance From 0th Member to Tile: ${distanceTileToZeroMember}`);

    let distanceTranslatedPointToZeroMember = Math.hypot(translatedNormalPoint.x - zeroMemberIntersection.x,
      translatedNormalPoint.y - zeroMemberIntersection.y)
    console.log(`Distance From 0th Member to Translated Point: ${distanceTranslatedPointToZeroMember}`);

    let distanceInLsToTile = this.findDistanceInTermsOfL(distanceTileToZeroMember, L);
      console.log(`Distance in L Computed From 0th Member to Tile: ${distanceInLsToTile}`);

    let distanceInLsToTranslatedPoint = this.findDistanceInTermsOfL(distanceTranslatedPointToZeroMember, L);
      console.log(`Distance in L Computed From 0th Member to Translated Point: ${distanceInLsToTranslatedPoint}`);

      if (distanceTileToZeroMember > distanceTranslatedPointToZeroMember) {

      //if ((Math.sign(normalPoint.x) == 0 && Math.sign(normalPoint.y) == -1) ||
        //(Math.sign(normalPoint.x) == 1 && Math.sign(normalPoint.y) == -1) ) {

        memberIndex = Math.floor(distanceInLsToTile);
        console.log(`Floor Computed, Member Index: ${memberIndex}`);

      } else if (distanceTileToZeroMember < distanceTranslatedPointToZeroMember) {

      //else if ((Math.sign(normalPoint.x) == 0 && Math.sign(normalPoint.y) == 1) ||
     //(Math.sign(normalPoint.x) == -1 && Math.sign(normalPoint.y) == 1) ) {

        memberIndex = Math.ceil(distanceInLsToTile)*Math.sign(lineON.member);
        console.log(`Ceiling Computed, Member Index: ${memberIndex}`);

      } else {

          console.log('Something went wrong!');
      }

    this.addTile(new PenroseTile(this.rhombusType(lineON, {family: familyIndex, member: memberIndex}),
      this.getIntersection(lineON,{family: familyIndex, member: memberIndex}),
      this.rhombusRotation(lineON, {family: familyIndex, member: memberIndex}),
      lineON, {family: familyIndex, member: memberIndex}))

    console.log(`Tile Added at Line On Family: ${lineON.family}, Member: ${lineON.member}
    AND Family: ${familyIndex}, Member: ${memberIndex} AT POINT: (${this.getIntersection(lineON,
      {family: familyIndex, member: memberIndex}).x}, ${this.getIntersection(lineON,
      {family: familyIndex, member: memberIndex}).y}` );

      console.log(`Member Index: ${memberIndex}`);

    return familyIndex;
  }




  findNextIntersection(gl1: GridLineIndex, gl2: GridLineIndex, direction: Vector2, sideIndex: number): number {
  // make return GridLineIndex

      // let nearestPoints: Vector2[] = [];
      let distancesInTermsOfL: number[] = [];
      // let nearestGLIs: GridLineIndex[] = Array.from({length: 5},
        // ()  => ({...{family: 0, member: 0}}));
      let lineON: GridLineIndex = {family: 0, member: 0};
      let lineCROSSING: GridLineIndex = {family: 0, member: 0};

      /*
          Rotate the respective outward facing normals by the rhomb about the origin so we get the correct orientation
          to move along the correct line
       */


      let orientationDirection = direction.rotateAround(new Vector2(0,0),
      this.rhombusRotation(gl1, gl2));

      // console.log(`Orientation Direction Side(${sideIndex}): (${orientationDirection.x}, ${orientationDirection.y})`);

    /*
       I want to find what line the direction vector lives on, therefore we can know which line we are on,
       and then which one is "crossing"
    */

      // Create a translated point by adding the orientation vector to the intersection point

      let translatedPoint = this.getIntersection(gl1,gl2).add(orientationDirection.multiplyScalar(0.1));

      // Some debugging console statements

      console.log(`Family ${gl1.family}, Member ${gl1.member} Parameters:
      (a - ${this.defineLine(gl1).a}, b - ${this.defineLine(gl1).b}, c - ${this.defineLine(gl1).c})`);

      console.log(`Family ${gl2.family}, Member ${gl2.member} Parameters:
      (a - ${this.defineLine(gl2).a}, b - ${this.defineLine(gl2).b}, c - ${this.defineLine(gl2).c})`);

      console.log(`Translated Point from Direction Normal: (${translatedPoint.x}, ${translatedPoint.y})`);


      // Determine which line we need to be on via the direction vector, with some debugging statements

      // if (this.defineLine(gl1).containsPoint(Complex.fromVector2(translatedPoint))) {
      if (this.lineContainsTranslatedPoint(this.defineLine(gl1), translatedPoint)) {

        console.log(`Family ${gl1.family}, Member ${gl1.member} contains the translated point.`);   // debug

        lineON = gl1;
        lineCROSSING = gl2;

      // } else if (this.defineLine(gl1).containsPoint(Complex.fromVector2(translatedPoint)))) {
      } else if (this.lineContainsTranslatedPoint(this.defineLine(gl2), translatedPoint)) {

        console.log(`Family ${gl2.family}, Member ${gl2.member} contains the translated point.`);   // debug

        lineON = gl2;
        lineCROSSING = gl1;

      }
        else {

          console.log('Something went wrong!'); // debug

      }

      // TODO find a way to cycle through the four families - mod5 - DONE

    distancesInTermsOfL[lineON.family] = 100;

      for (let i = 1; i < 5; i++) {

        /* if (i == lineCROSSING.family) {

          console.log(`Skip Family: ${lineCROSSING.family} that line is crossing.`)
          continue;
        } */

        console.log(`Finding Family: ${(lineON.family + i) % 5} Member Index. Calling findMemberIndex`);

        distancesInTermsOfL[(lineON.family + i) % 5] = this.findMemberIndex(
            this.getIntersection(gl1, gl2), translatedPoint, direction, this.rhombusType(
              {family: (lineON.family + i) % 5, member:0}, lineON), (lineON.family + i) % 5, lineON);

      }

      // TODO create method to find distance ito L, use the ceiling/floor property then and output member indices
      // TODO then compute euclidean distances once we have GLIs, then return out that GLI!

    // Will return a GLI in the future, we just have this for debugging purposes right now

    return 0 ;
  }


  adjacentTile(t: PenroseTile, sideIndex: number): PenroseTile {

    // Attach side indices and tile, choose the line we are moving along and then the direction

    /*
        changed to this.tiling.generate(2) in resetTiling() withing tiling-billiards-component
    */

    console.log(`Side Index: ${sideIndex}`);

    let normalVector = this.tileset[t.tilesetIndex].polygon.sideNormal(sideIndex);

    console.log(`Normal Vector: (${normalVector.x},${normalVector.y})`);

    let nextIntersection = this.findNextIntersection(t.gridLineIndex1, t.gridLineIndex2,
     normalVector, sideIndex);


    // Will return a Penrose tile at some point

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

    console.log(`First Tile START`);  // debug

    const positionPoint = this.getIntersection({family: 0, member: -1},{family: 1, member: -1});

    console.log(`First Tile position: (${positionPoint.x}, ${positionPoint.y})`);   // debug

    console.log(`First Tile END`);    // debug



    return new PenroseTile(this.rhombusType({family: 0, member: -1}, {family: 1, member: -1}),
      new Vector2(positionPoint.x, positionPoint.y),
      this.rhombusRotation({family: 0, member: -1}, {family: 1, member: -1}),
      {family: 0, member: -1}, {family: 1, member: -1});

  }


}

