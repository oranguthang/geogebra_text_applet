## GeoGebraTextApplet
Simple GeoGebra applet which supports some commands in natural (English or Russian) languages.
Project uses [this empty geometrical worksheet](https://www.geogebra.org/material/simple/id/3146123) to create a workspace.

## How to Use

Open the `applet.html` file in your browser and wait for the applet to be loaded from the GeoGebra official site, then select type of commands. If you choose "Natural language" commands, select your language and type of recognition. After all, enter your commands in text input and then click "Go!" button.

## Main features

   * GeoGebra Commands (e.g. `A=(4,5)`)
   * Natural language commands in English and Russian languages (e.g. `Let A, B, C be points.`):
     * One pattern mode (one command line for one sentence, e.g. `Let AB be a line.`)
     * Multi-pattern mode (e.g. `Let A, B be points and line CD.` -- currently works only for Russian language)
     * Each sentence should end with a period
   * Show GeoGebra Commands, needed for drawing current construction by clicking the corresponding button

## Examples

GeoGebra Commands Mode:

    A=(2,4)
    B=(4,3)
    C=(6,5)
    S=(5,10)
    a=Segment[A,B]
    b=Segment[A,C]
    SetLineStyle[b,2]
    c=Segment[B,C]
    d=Segment[S,A]
    e=Segment[S,B]
    f=Segment[S,C]
    A'=Midpoint[d]
    B'=Midpoint[f]
    C'=Midpoint[e]
    g=Segment[A',B']
    SetLineStyle[g,2]
    h=Segment[A',C']
    SetLineStyle[h,2]
    i=Segment[B',C']
    SetLineStyle[i,2]
    p=Polygon[A',B',C']
    SetLineStyle[p,2]
    SetColor[p,green]

One pattern mode:

    Let AB be a line segment.
    Let BC be the line.
    Let M be a midpoint of line segment AB.
    Let ABC be a triangle.

Multi-pattern mode:

    Дана точка A и треугольник ABC, через точку A проходит прямая AD.

## Screenshots

![](http://i.imgur.com/qO62BCU.png "")

## License

This project is licensed under the GPLv3 license.
