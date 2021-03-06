function ShapeEntity(Interceptor, shapeObject, shapeArgs, canvasX, canvasY) {
  const self = this;
  /* global BaseEntity */
  BaseEntity.call(self, shapeObject, shapeArgs, canvasX, canvasY);
  this.areaAbs = 0;
  this.type = Interceptor.currentColor + ` ` + shapeObject.name;
  this.area = 0;

  this.populate = function(shapeObject, shapeArgs, canvasX, canvasY) {
    this.location = this.getLocation(shapeObject, shapeArgs, canvasX, canvasY);
    this.areaAbs = this.getObjectArea(shapeObject.name, shapeArgs);
    this.coordLoc = this.canvasLocator(shapeObject, shapeArgs, canvasX, canvasY);
    this.area = (this.getObjectArea(shapeObject.name, shapeArgs) * 100 / (canvasX * canvasY)).toFixed(2) + `%`;
  }

  this.getAttributes = function() {
    return ({
      type: this.type,
      location: this.location,
      coordinates: this.coordinates,
      area: this.area
    })
  };

  /* return area of the shape */
  this.getObjectArea = function(objectType, shapeArgs) {
    let objectArea = 0;
    if (!objectType.localeCompare(`arc`)) {
      // area of full ellipse = PI * horizontal radius * vertical radius.
      // therefore, area of arc = difference bet. arc's start and end radians * horizontal radius * vertical radius.
      // the below expression is adjusted for negative values and differences in arc's start and end radians over PI*2
      const arcSizeInRadians = ((((shapeArgs[5] - shapeArgs[4]) % (PI * 2)) + (PI * 2)) % (PI * 2));
      objectArea = arcSizeInRadians * shapeArgs[2] * shapeArgs[3] / 8;
      if (shapeArgs[6] === `open` || shapeArgs[6] === `chord`) {
        // when the arc's mode is OPEN or CHORD, we need to account for the area of the triangle that is formed to close the arc
        // (Ax( By −	Cy) +	Bx(Cy −	Ay) +	Cx(Ay −	By ) )/2
        const Ax = shapeArgs[0];
        const Ay = shapeArgs[1];
        const Bx = shapeArgs[0] + (shapeArgs[2] / 2) * cos(shapeArgs[4]).toFixed(2);
        const By = shapeArgs[1] + (shapeArgs[3] / 2) * sin(shapeArgs[4]).toFixed(2);
        const Cx = shapeArgs[0] + (shapeArgs[2] / 2) * cos(shapeArgs[5]).toFixed(2);
        const Cy = shapeArgs[1] + (shapeArgs[3] / 2) * sin(shapeArgs[5]).toFixed(2);
        const areaOfExtraTriangle = abs(Ax * (By - Cy) + Bx * (Cy - Ay) + Cx * (Ay - By)) / 2;
        if (arcSizeInRadians > PI) {
          objectArea = objectArea + areaOfExtraTriangle;
        } else {
          objectArea = objectArea - areaOfExtraTriangle;
        }
      }
    } else if (!objectType.localeCompare(`ellipse`)) {
      objectArea = 3.14 * shapeArgs[2] * shapeArgs[3] / 4;
    } else if (!objectType.localeCompare(`line`)) {
      objectArea = 0;
    } else if (!objectType.localeCompare(`point`)) {
      objectArea = 0;
    } else if (!objectType.localeCompare(`quad`)) {
      // x1y2+x2y3+x3y4+x4y1−x2y1−x3y2−x4y3−x1y4
      objectArea = (shapeArgs[0] * shapeArgs[1] + shapeArgs[2] * shapeArgs[3] +
                    shapeArgs[4] * shapeArgs[5] + shapeArgs[6] * shapeArgs[7]) -
                (shapeArgs[2] * shapeArgs[1] + shapeArgs[4] * shapeArgs[3] +
                    shapeArgs[6] * shapeArgs[5] + shapeArgs[0] * shapeArgs[7]);
    } else if (!objectType.localeCompare(`rect`)) {
      objectArea = shapeArgs[2] * shapeArgs[3];
    } else if (!objectType.localeCompare(`triangle`)) {
      objectArea = abs(shapeArgs[0] * (shapeArgs[3] - shapeArgs[5]) + shapeArgs[2] * (shapeArgs[5] - shapeArgs[1]) +
                shapeArgs[4] * (shapeArgs[1] - shapeArgs[3])) / 2;
      // (Ax( By −	Cy) +	Bx(Cy −	Ay) +	Cx(Ay −	By ))/2
    }
    return objectArea;
  }

  this.populate(shapeObject, shapeArgs, canvasX, canvasY);
}

ShapeEntity.handledNames = [
  `arc`,
  `ellipse`,
  `line`,
  `point`,
  `quad`,
  `rect`,
  `triangle`
]

ShapeEntity.handles = function(name) {
  return (this.handledNames.indexOf(name) >= 0);
}

ShapeEntity.isParameter = false;

/* global Registry */
Registry.register(ShapeEntity);
