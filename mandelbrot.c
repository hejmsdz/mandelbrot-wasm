#define scale(val, max0, min1, max1) ((double)(val)*((max1)-(min1))/(max0) + (min1))
#define STEPS 50

struct color {
  unsigned char r, g, b;
};

struct color palette[STEPS+1];

void generatePalette(int color0, int color1) {
    unsigned char r0, g0, b0, r1, g1, b1;
    
    r0 = (color0 & 0xff0000) >> 16;
    r1 = (color1 & 0xff0000) >> 16;
    g0 = (color0 & 0x00ff00) >> 8;
    g1 = (color1 & 0x00ff00) >> 8;
    b0 = (color0 & 0x0000ff);
    b1 = (color1 & 0x0000ff);
    
    int i;
    for (i=0; i<=STEPS; i++) {
        struct color c = {scale(i, STEPS, r0, r1), scale(i, STEPS, g0, g1), scale(i, STEPS, b0, b1)};
        palette[i] = c;
    }
}

void mandelbrot(int width, int height, double cx, double cy, double scale, unsigned char *imgdata) {
    int px, py, it;
    double re, im, x, y, xtemp, frac;

    double x0 = cx - width/(2*scale);
    double y0 = cy - height/(2*scale);
    
    for (py=0; py<height; py++) {
        for (px=0; px<width; px++) {
            re = x0 + px/scale;
            im = y0 + py/scale;
            
            x = y = 0.0;
            it = 0;

            while (x*x + y*y < 2*2 && it < STEPS) {
                xtemp = x*x - y*y + re;
                y = 2*x*y + im;
                x = xtemp;
                it++;
            }
            
            *(imgdata++) = palette[it].r;
            *(imgdata++) = palette[it].g;
            *(imgdata++) = palette[it].b;
            *(imgdata++) = 255;
        }
    }
}
