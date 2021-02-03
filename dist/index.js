(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('noise-utils', ['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['noise-utils'] = {}));
}(this, (function (exports) { 'use strict';

  var Noise = /** @class */ (function () {
      function Noise() {
      }
      Noise.Init = function (seed) {
          this.initialized = true;
          this.grad3 = [
              new Grad(1, 1, 0),
              new Grad(-1, 1, 0),
              new Grad(1, -1, 0),
              new Grad(-1, -1, 0),
              new Grad(1, 0, 1),
              new Grad(-1, 0, 1),
              new Grad(1, 0, -1),
              new Grad(-1, 0, -1),
              new Grad(0, 1, 1),
              new Grad(0, -1, 1),
              new Grad(0, 1, -1),
              new Grad(0, -1, -1),
          ];
          this.p = [
              151,
              160,
              137,
              91,
              90,
              15,
              131,
              13,
              201,
              95,
              96,
              53,
              194,
              233,
              7,
              225,
              140,
              36,
              103,
              30,
              69,
              142,
              8,
              99,
              37,
              240,
              21,
              10,
              23,
              190,
              6,
              148,
              247,
              120,
              234,
              75,
              0,
              26,
              197,
              62,
              94,
              252,
              219,
              203,
              117,
              35,
              11,
              32,
              57,
              177,
              33,
              88,
              237,
              149,
              56,
              87,
              174,
              20,
              125,
              136,
              171,
              168,
              68,
              175,
              74,
              165,
              71,
              134,
              139,
              48,
              27,
              166,
              77,
              146,
              158,
              231,
              83,
              111,
              229,
              122,
              60,
              211,
              133,
              230,
              220,
              105,
              92,
              41,
              55,
              46,
              245,
              40,
              244,
              102,
              143,
              54,
              65,
              25,
              63,
              161,
              1,
              216,
              80,
              73,
              209,
              76,
              132,
              187,
              208,
              89,
              18,
              169,
              200,
              196,
              135,
              130,
              116,
              188,
              159,
              86,
              164,
              100,
              109,
              198,
              173,
              186,
              3,
              64,
              52,
              217,
              226,
              250,
              124,
              123,
              5,
              202,
              38,
              147,
              118,
              126,
              255,
              82,
              85,
              212,
              207,
              206,
              59,
              227,
              47,
              16,
              58,
              17,
              182,
              189,
              28,
              42,
              223,
              183,
              170,
              213,
              119,
              248,
              152,
              2,
              44,
              154,
              163,
              70,
              221,
              153,
              101,
              155,
              167,
              43,
              172,
              9,
              129,
              22,
              39,
              253,
              19,
              98,
              108,
              110,
              79,
              113,
              224,
              232,
              178,
              185,
              112,
              104,
              218,
              246,
              97,
              228,
              251,
              34,
              242,
              193,
              238,
              210,
              144,
              12,
              191,
              179,
              162,
              241,
              81,
              51,
              145,
              235,
              249,
              14,
              239,
              107,
              49,
              192,
              214,
              31,
              181,
              199,
              106,
              157,
              184,
              84,
              204,
              176,
              115,
              121,
              50,
              45,
              127,
              4,
              150,
              254,
              138,
              236,
              205,
              93,
              222,
              114,
              67,
              29,
              24,
              72,
              243,
              141,
              128,
              195,
              78,
              66,
              215,
              61,
              156,
              180,
          ];
          // To remove the need for index wrapping, double the permutation table length
          this.perm = new Array(512);
          this.gradP = new Array(512);
          // Skewing and unskewing factors for 2, 3, and 4 dimensions
          this.F2 = 0.5 * (Math.sqrt(3) - 1);
          this.G2 = (3 - Math.sqrt(3)) / 6;
          this.F3 = 1 / 3;
          this.G3 = 1 / 6;
          this.seed(seed ? seed : Math.random());
      };
      // This isn't a very good seeding function, but it works ok. It supports 2^16
      // different seed values. Write something better if you need more seeds.
      Noise.seed = function (seed) {
          if (!this.initialized) {
              this.Init();
          }
          if (seed > 0 && seed < 1) {
              // Scale the seed out
              seed *= 65536;
          }
          seed = Math.floor(seed);
          if (seed < 256) {
              seed |= seed << 8;
          }
          for (var i = 0; i < 256; i++) {
              var v;
              if (i & 1) {
                  v = this.p[i] ^ (seed & 255);
              }
              else {
                  v = this.p[i] ^ ((seed >> 8) & 255);
              }
              this.perm[i] = this.perm[i + 256] = v;
              this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
          }
      };
      /*
              for(var i=0; i<256; i++) {
                perm[i] = perm[i + 256] = p[i];
                gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
              }*/
      // 2D simplex noise
      Noise.simplex2 = function (xin, yin) {
          if (!this.initialized) {
              this.Init();
          }
          var n0, n1, n2; // Noise contributions from the three corners
          // Skew the input space to determine which simplex cell we're in
          var s = (xin + yin) * this.F2; // Hairy factor for 2D
          var i = Math.floor(xin + s);
          var j = Math.floor(yin + s);
          var t = (i + j) * this.G2;
          var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
          var y0 = yin - j + t;
          // For the 2D case, the simplex shape is an equilateral triangle.
          // Determine which simplex we are in.
          var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
          if (x0 > y0) {
              // lower triangle, XY order: (0,0)->(1,0)->(1,1)
              i1 = 1;
              j1 = 0;
          }
          else {
              // upper triangle, YX order: (0,0)->(0,1)->(1,1)
              i1 = 0;
              j1 = 1;
          }
          // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
          // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
          // c = (3-sqrt(3))/6
          var x1 = x0 - i1 + this.G2; // Offsets for middle corner in (x,y) unskewed coords
          var y1 = y0 - j1 + this.G2;
          var x2 = x0 - 1 + 2 * this.G2; // Offsets for last corner in (x,y) unskewed coords
          var y2 = y0 - 1 + 2 * this.G2;
          // Work out the hashed gradient indices of the three simplex corners
          i &= 255;
          j &= 255;
          var gi0 = this.gradP[i + this.perm[j]];
          var gi1 = this.gradP[i + i1 + this.perm[j + j1]];
          var gi2 = this.gradP[i + 1 + this.perm[j + 1]];
          // Calculate the contribution from the three corners
          var t0 = 0.5 - x0 * x0 - y0 * y0;
          if (t0 < 0) {
              n0 = 0;
          }
          else {
              t0 *= t0;
              n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
          }
          var t1 = 0.5 - x1 * x1 - y1 * y1;
          if (t1 < 0) {
              n1 = 0;
          }
          else {
              t1 *= t1;
              n1 = t1 * t1 * gi1.dot2(x1, y1);
          }
          var t2 = 0.5 - x2 * x2 - y2 * y2;
          if (t2 < 0) {
              n2 = 0;
          }
          else {
              t2 *= t2;
              n2 = t2 * t2 * gi2.dot2(x2, y2);
          }
          // Add contributions from each corner to get the final noise value.
          // The result is scaled to return values in the interval [-1,1].
          return 70 * (n0 + n1 + n2);
      };
      // 3D simplex noise
      Noise.simplex3 = function (xin, yin, zin) {
          if (!this.initialized) {
              this.Init();
          }
          var n0, n1, n2, n3; // Noise contributions from the four corners
          // Skew the input space to determine which simplex cell we're in
          var s = (xin + yin + zin) * this.F3; // Hairy factor for 2D
          var i = Math.floor(xin + s);
          var j = Math.floor(yin + s);
          var k = Math.floor(zin + s);
          var t = (i + j + k) * this.G3;
          var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
          var y0 = yin - j + t;
          var z0 = zin - k + t;
          // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
          // Determine which simplex we are in.
          var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
          var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
          if (x0 >= y0) {
              if (y0 >= z0) {
                  i1 = 1;
                  j1 = 0;
                  k1 = 0;
                  i2 = 1;
                  j2 = 1;
                  k2 = 0;
              }
              else if (x0 >= z0) {
                  i1 = 1;
                  j1 = 0;
                  k1 = 0;
                  i2 = 1;
                  j2 = 0;
                  k2 = 1;
              }
              else {
                  i1 = 0;
                  j1 = 0;
                  k1 = 1;
                  i2 = 1;
                  j2 = 0;
                  k2 = 1;
              }
          }
          else {
              if (y0 < z0) {
                  i1 = 0;
                  j1 = 0;
                  k1 = 1;
                  i2 = 0;
                  j2 = 1;
                  k2 = 1;
              }
              else if (x0 < z0) {
                  i1 = 0;
                  j1 = 1;
                  k1 = 0;
                  i2 = 0;
                  j2 = 1;
                  k2 = 1;
              }
              else {
                  i1 = 0;
                  j1 = 1;
                  k1 = 0;
                  i2 = 1;
                  j2 = 1;
                  k2 = 0;
              }
          }
          // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
          // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
          // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
          // c = 1/6.
          var x1 = x0 - i1 + this.G3; // Offsets for second corner
          var y1 = y0 - j1 + this.G3;
          var z1 = z0 - k1 + this.G3;
          var x2 = x0 - i2 + 2 * this.G3; // Offsets for third corner
          var y2 = y0 - j2 + 2 * this.G3;
          var z2 = z0 - k2 + 2 * this.G3;
          var x3 = x0 - 1 + 3 * this.G3; // Offsets for fourth corner
          var y3 = y0 - 1 + 3 * this.G3;
          var z3 = z0 - 1 + 3 * this.G3;
          // Work out the hashed gradient indices of the four simplex corners
          i &= 255;
          j &= 255;
          k &= 255;
          var gi0 = this.gradP[i + this.perm[j + this.perm[k]]];
          var gi1 = this.gradP[i + i1 + this.perm[j + j1 + this.perm[k + k1]]];
          var gi2 = this.gradP[i + i2 + this.perm[j + j2 + this.perm[k + k2]]];
          var gi3 = this.gradP[i + 1 + this.perm[j + 1 + this.perm[k + 1]]];
          // Calculate the contribution from the four corners
          var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
          if (t0 < 0) {
              n0 = 0;
          }
          else {
              t0 *= t0;
              n0 = t0 * t0 * gi0.dot3(x0, y0, z0); // (x,y) of grad3 used for 2D gradient
          }
          var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
          if (t1 < 0) {
              n1 = 0;
          }
          else {
              t1 *= t1;
              n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
          }
          var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
          if (t2 < 0) {
              n2 = 0;
          }
          else {
              t2 *= t2;
              n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
          }
          var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
          if (t3 < 0) {
              n3 = 0;
          }
          else {
              t3 *= t3;
              n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
          }
          // Add contributions from each corner to get the final noise value.
          // The result is scaled to return values in the interval [-1,1].
          return 32 * (n0 + n1 + n2 + n3);
      };
      // ##### Perlin noise stuff
      Noise.fade = function (t) {
          return t * t * t * (t * (t * 6 - 15) + 10);
      };
      Noise.lerp = function (a, b, t) {
          return (1 - t) * a + t * b;
      };
      // 2D Perlin Noise
      Noise.perlin2 = function (x, y) {
          if (!this.initialized) {
              this.Init();
          }
          // Find unit grid cell containing point
          var X = Math.floor(x), Y = Math.floor(y);
          //   console.log("floored X " + x);
          // Get relative xy coordinates of point within that cell
          x = x - X;
          y = y - Y;
          //     console.log("relative X " + x);
          // Wrap the integer cells at 255 (smaller integer period can be introduced here)
          X = X & 255;
          Y = Y & 255;
          //    console.log("relative X " + x);
          //  console.log("calc " + calc);
          //  console.log("dot2 " + calc.dot2(x,y));
          // Calculate noise contributions from each of the four corners
          var n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
          var n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
          var n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
          var n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);
          /*
                    console.log("n00 " + n00);
                    console.log("n01 " + n01);
                    console.log("n10 " + n10);
                    console.log("n11 " + n11);
           */
          // Compute the fade curve value for x
          var u = this.fade(x);
          //console.log("fade x " + x);
          //console.log("u " + u);
          // Interpolate the four results
          return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
      };
      // 3D Perlin Noise
      Noise.perlin3 = function (x, y, z) {
          if (!this.initialized) {
              this.Init();
          }
          // Find unit grid cell containing point
          var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
          // Get relative xyz coordinates of point within that cell
          x = x - X;
          y = y - Y;
          z = z - Z;
          // Wrap the integer cells at 255 (smaller integer period can be introduced here)
          X = X & 255;
          Y = Y & 255;
          Z = Z & 255;
          // Calculate noise contributions from each of the eight corners
          var n000 = this.gradP[X + this.perm[Y + this.perm[Z]]].dot3(x, y, z);
          var n001 = this.gradP[X + this.perm[Y + this.perm[Z + 1]]].dot3(x, y, z - 1);
          var n010 = this.gradP[X + this.perm[Y + 1 + this.perm[Z]]].dot3(x, y - 1, z);
          var n011 = this.gradP[X + this.perm[Y + 1 + this.perm[Z + 1]]].dot3(x, y - 1, z - 1);
          var n100 = this.gradP[X + 1 + this.perm[Y + this.perm[Z]]].dot3(x - 1, y, z);
          var n101 = this.gradP[X + 1 + this.perm[Y + this.perm[Z + 1]]].dot3(x - 1, y, z - 1);
          var n110 = this.gradP[X + 1 + this.perm[Y + 1 + this.perm[Z]]].dot3(x - 1, y - 1, z);
          var n111 = this.gradP[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);
          // Compute the fade curve value for x, y, z
          var u = this.fade(x);
          var v = this.fade(y);
          var w = this.fade(z);
          // Interpolate
          return this.lerp(this.lerp(this.lerp(n000, n100, u), this.lerp(n001, n101, u), w), this.lerp(this.lerp(n010, n110, u), this.lerp(n011, n111, u), w), v);
      };
      Noise.initialized = false;
      return Noise;
  }());
  var Grad = /** @class */ (function () {
      function Grad(x, y, z) {
          this.vector = new Vector3(x, y, z);
      }
      Grad.prototype.dot2 = function (x, y) {
          return this.vector.x * x + this.vector.y * y;
      };
      Grad.prototype.dot3 = function (x, y, z) {
          return this.vector.x * x + this.vector.y * y + this.vector.z * z;
      };
      return Grad;
  }());

  exports.Noise = Noise;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
