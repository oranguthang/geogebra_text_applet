var lang = 0, oldlang = -1, metd = 0;
var flag = false, scnd = false;
var error = false;
var tm = [];
var prior = [];
var allcmds = "";
var lists = [];
var numsinlists = [];
var pointislast = false;
var lastpnt = "";
var punct = ['\'', ',', '.', '?', '!', ':', ';'];
var alpha = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var num = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var alphartnl = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];

var alphanumpunct = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        ' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+',
        ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[',
        '\\', ']', '^', '_', '`', '{', '|', '}', '~'];
var alphanum = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

var x1 = 1, x2 = 11;
var y1 = 1, y2 = 11;

var littlenum = ((x2 - x1) + (y2 - y1)) / 100;

var countp = 0, countids = 0, countobjects = 0, countpnts = 0;

var obj = [];
var point = [];
var pattern = [];
var list = new wordList();
var keywords = new wordList();
    
var usedids = new wordList();
var controlwords = new wordList();
var currentids = new wordList();
var currentlists = new wordList();
var colors = new wordList();
var currentcolors = new wordList();
var currentnumbers = new wordList();
var commands = new wordList();

var ggb = new GGBApplet({material_id: "3146123", width:500, height:500}, true);
window.onload = function() {
    ggb.inject('applet_container', 'preferHTML5');
    setInterval(updPlot, 100);
}

function ggbOnInit() {
    ggb = document.ggbApplet;
    ggb.registerObjectUpdateListener("tfTrace", "traceOnOff");
    ggb.registerClearListener("ggbOnClear");
}

function updPlot() {
    if (!flag) {
        if (ggb.evalCommand("ZoomIn[" + x1 + "," + y1 + "," + x2 + "," + y2 + "]")) {
            flag = true;
        }
    }
}

function appletDeleteAll() {
    allcmds = "";
    var length = ggb.getObjectNumber();
    var i = 0;
    var names = new Array();
    for (i = 0; i < length; i++) {
        names[i] = ggb.getObjectName(i);
    }
    for (i = 0; i < length; i++) {
        ggb.deleteObject(names[i]);
    }
    usedids.clear();
    countids = 0;
    countobjects = 0;
    obj = [];
    point = [];
}

// round function, x - number, n - number digits
function roundPlus(x, n) {
    if (isNaN(x) || isNaN(n)) return false;
    var m = Math.pow(10, n);
    return Math.round(x * m) / m;
}

function printCommands() {
    var str = "To draw this image, you must enter the following GeoGebra Commands:" + "<br>";
    str += allcmds;
    var sdiv = document.getElementById("cmds"); 
    sdiv.innerHTML = str;
}

String.prototype.replaceAt = function(index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

String.prototype.replaceAll = function(search, replace) {
    return this.split(search).join(replace);
}

// function to count milliseconds from its first to second run
function wt() {
    if (!scnd) {
        tm[tm.length] = Date.now();
        scnd = true;
    }
    else {
        tm[tm.length] = Date.now();
        var res = tm[1] - tm[0];
        tm = [];
        scnd = false;
        alert("The time of execution is <" + res + "> ms.");
    }
}

function setPriority(l, r) {
    prior[prior.length] = l;
    prior[prior.length] = r;
}

function isLess(l, r) {
    var res = false;
    for (var i = 0; i < prior.length; i += 2) {
        if ((prior[i] == l) && (prior[i + 1] == r)) {
            res = true;
            break;
        }
    }
    return res;
}

function nextLetter(s){
    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function(a){
        var c = a.charCodeAt(0);
        switch(c){
            case 90: return 'A';
            case 122: return 'a';
            default: return String.fromCharCode(++c);
        }
    });
}

function inPunct(c) {
    var flag = false;
    for (var i = 0; i < punct.length; i++) {
        if (punct[i] == c) {
            flag = true;
            break;
        }
    }
    return flag;
}

function inAlpha(c) {
    var flag = false;
    for (var i = 0; i < alpha.length; i++) {
        if (alpha[i] == c) {
            flag = true;
            break;
        }
    }
    return flag;
}

function inNum(c) {
    var flag = false;
    for (var i = 0; i < num.length; i++) {
        if (num[i] == c) {
            flag = true;
            break;
        }
    }
    return flag;
}

function inAlphaForRationals(c) {
    var flag = false;
    for (var i = 0; i < alphartnl.length; i++) {
        if (alphartnl[i] == c) {
            flag = true;
            break;
        }
    }
    return flag;
}

function subString(sub, str) {
    var i;
    var substring_result;
    i = strPos(sub, str);
    substring_result = (i != -1);
    return substring_result;
}

function strTrim(s) {
    var res = "";
    var m = 0, n = s.length - 1;
    while (s[m] == " ") m++;
    while (s[n] == " ") n--;
    for (var i = m; i <= n; i++) {
        res += s[i];
    }
    return res;
}

function removeDoubleSpaces(s) {
    var i;
    i = strPos("  ", s);
    while (i != -1) {
        s = strDelete(s, i, 1);
        i = strPos("  ", s);
    }
    return s;
}

function strDelete(s, m, count) {
    var res = "";
    for (var i = 0; i < m; i++) {
        res += s[i];
    }
    for (var i = m + count; i < s.length; i++) {
        res += s[i];
    }
    return res;
}

function strInsert(src, s, m) {
    var res = "";
    if (m < src.length) {
        for (var i = 0; i < m; i++) {
            res += src[i];
        }
        for (var i = 0; i < s.length; i++) {
            res += s[i];
        }
        for (var i = m; i < src.length; i++) {
            res += src[i];
        }
    }
    return res;
}

function deleteAllSymbols(s) {
    var tild = "~";
    var res = "";
    for (var k = 0; k < s.length; k++) {
        if (inPunct(s[k])) {
            if ((s[k] == ",") && (k != 0) && (k != (s.length - 1))) {
                if (inNum(s[k - 1]) && inNum(s[k + 1])) {
                    res += tild;
                }
            }
        }
        else {
            res += s[k];
        }
    }
    s = res;
    k = strPos(tild, s);
    while (k != -1) {
        s = s.replaceAt(k, ",");
        k = strPos(tild, s);
    }
    return s;
}

function isId(s) {
    var f;
    var i, n;
    var isid_result;
    if (s != "") {
        isid_result = true;
        if (inAlpha(s[0])) {
            n = s.length;
            if (n >= 2) {
                for (i = 1; i < n; i ++) {
                    if (!(inAlpha(s[i]) || inNum(s[i]) || (s[i] == "_"))) {
                        isid_result = false;
                    }
                }
                for (i = 1; i < n - 1; i ++) {
                    if ((inNum(s[i]) && inNum(s[i + 1])) || ((s[i] == '_') && (s[i + 1] == '_'))) {
                        isid_result = false;
                    }
                }
            }
        }
        else {
            isid_result = false;
        }
    }
    else {
        isid_result = false;
    }
    return isid_result;
}

function isList(s) {
    var i = 0, n = s.length;
    var fl = false;
    while ((inAlpha(s[i]) || inNum(s[i]) || (s[i] == '_') || (s[i] == '$')) && (i < n)) {
        i++;
        if (s[i] == '$') fl = true;
    }
    return ((i == n) && fl);
}

function strCopy(s, m, count) {
    var res = "";
    for (var i = m; i < m + count; i++) {
        res += s[i];
    }
    return res;
}

function strPos(sub, str) {
    var res = -1;
    for (var i = 0; i < str.length - sub.length + 1; i++) {
        if (str[i] == sub[0]) {
            for (var j = 0; j < sub.length; j++) {
                if (str[i + j] != sub[j]) break;
                if (j == sub.length - 1) {
                    res = i;
                }
            }
            if (res != -1) break;
        }
    }
    return res;
}

function strReplaceEnters(s) {
    var res = "";
    for (var i = 0; i < s.length; i++) {
        if (s[i] != "\n") {
            res += s[i];
        }
        else {
            res += " ";
        }
    }
    return res;
}

function convertIdLists(s) {
    var i = 0, l = 0, r = 0, n = 0;
    var v = "";
    var comma;
    n = s.length;
    while (i < n) {
        comma = false;
        while (!inAlpha(s[i]) && (i < n)) {
            i++;
        }
        l = i;
        while ((inAlpha(s[i]) || inNum(s[i]) || (s[i] == ' ') || (s[i] == '_') || (s[i] == ',')) && (i < n)) {
            if (s[i] == ',') {
                comma = true;
            }
            i++;
        }
        r = i;
        if (comma) {
            while ((s[r] != ' ') && (r != n - 1)) {
                r--;
            }
            if (s[r - 1] == ",") r-=2;
            v = strCopy(s, l, r - l);
            v = strTrim(v);
            v = removeDoubleSpaces(v);
            v = v.replaceAll(' ', '');
            v = v.replaceAll(',', '$');
            s = strDelete(s, l, r - l);
            s = strInsert(s, v, l);
        }
    }
    return s;
}

// MyObject's constructor
function myObject(type_, name_) {
    this.objType = type_;
    this.name = name_;
    this.points = [];
    
    this.addPoint = function(str) {
        this.points[this.points.length] = str;
    }
    
    this.print = function() {
        alert("Object:" + this.objType + " " + this.name);
    }
    
    // clear all object's fields
    this.clear = function() {
        this.objType = "";
        this.name = "";
        this.points = [];
    }
    
    this.countPoints = function() {
        return this.points.length;
    }
}

// WordList's constructor
function wordList() {
    this.words = [];
    
    // add a new word
    this.add = function(str) {
        this.words[this.words.length] = str;
    }
    
    // add words from string
    this.parseFromString = function(s) {
        var i, k;
        var p;
        
        s = strTrim(s);
        s = removeDoubleSpaces(s);
        s = convertIdLists(s);
        s = deleteAllSymbols(s);
        i = strPos(' ', s);
        while (i != -1) {
            p = strCopy(s, 0, i);
            if (!isId(p) && (!isList(p))) p = p.toLowerCase();
            this.words[this.words.length] = p;
            s = strDelete(s, 0, i + 1);
            i = strPos(' ', s);
        }
        if (!isId(s) && (!isList(s))) s = s.toLowerCase();
        this.words[this.words.length] = s;
    }
    
    // display all words in alert box
    this.print = function() {
        alert(this.words);
    }
    
    // clear all words
    this.clear = function() {
        this.words = [];
    }
    
    // display number of words
    this.count = function() {
        return this.words.length;
    }
}

// Pattern's constructor
function patternList(s) {
    this.words = [];
    this.answer = "";
    this.controls = 0;
    this.keys = 0;
    this.ids = 0;
    this.numbers = 0;
    this.lists = 0;
    
    // add a new word
    this.add = function(str) {
        this.words[this.words.length] = str;
    }
    
    var i, k;
    
    i = strPos(':', s);
    this.keys = parseInt(strCopy(s, 0, i));
    s = strDelete(s, 0, i + 1);
    i = strPos(':', s);
    this.ids = parseInt(strCopy(s, 0, i));
    s = strDelete(s, 0, i + 1);
    i = strPos(':', s);
    this.numbers = parseInt(strCopy(s, 0, i));
    s = strDelete(s, 0, i + 1);
    i = strPos(':', s);
    this.lists = parseInt(strCopy(s, 0, i));
    s = strDelete(s, 0, i + 1);
    i = strPos('|', s);
    // add words from string
    while (i != -1) {
        this.add(strCopy(s, 0, i));
        s = strDelete(s, 0, i + 1);
        i = strPos('|', s);
    }
    i = strPos(':', s);
    this.add(strCopy(s, 0, i));
    s = strDelete(s, 0, i + 1);
    this.answer = s;
    
    // display all words in alert box
    this.print = function() {
        alert(this.words);
    }
    
    // clear all words
    this.clear = function() {
        this.words = [];
    }
    
    // display number of words
    this.count = function() {
        return this.words.length;
    }
}

// main function, which initializes all the keywords and patterns
function main() {
    if (lang == 0) {
        if (metd == 0) {
            keywords.clear();
            colors.clear();
            pattern = [];
            keywords.parseFromString("let set in to up right down left delete move paint");
            keywords.parseFromString("point points line midpoint triangle triangles size segment circle radius center quadrilateral quadrilaterals");
            keywords.parseFromString("aqua black blue fuchsia gray green lime maroon navy olive purple red silver teal white yellow"); // colors as keywords
            colors.parseFromString("aqua black blue fuchsia gray green lime maroon navy olive purple red silver teal white yellow");
            pattern[pattern.length] = new patternList("2:1:0:0:let|_id(0,1)|point:<_id(0,1)>=(<_X,_Y>)");
            pattern[pattern.length] = new patternList("2:1:0:0:let|_id(0,2)|line:<_id(0,1,1,lower)>=Line(<_id(0,1,1)>,<_id(0,1,2)>)");
            pattern[pattern.length] = new patternList("3:1:0:0:let|_id(0,2)|line|segment:<_id(0,1,1,lower)>=Segment(<_id(0,1,1)>,<_id(0,1,2)>)");
            pattern[pattern.length] = new patternList("3:2:0:0:let|_id(0,1)|midpoint|line|_id(1,2):<_id(0,1)>=Midpoint(<_id(1,1,1)>,<_id(1,1,2)>)");
            pattern[pattern.length] = new patternList("4:2:0:0:let|_id(0,1)|midpoint|line|segment|_id(1,2):<_id(0,1)>=Midpoint(<_id(1,1,1)>,<_id(1,1,2)>)");
            pattern[pattern.length] = new patternList("2:1:0:0:let|_id(0,3)|triangle:<_id(0,1,1,lower)>=Polygon(<_id(0,1,1)>,<_id(0,1,2)>,<_id(0,1,3)>)");
            pattern[pattern.length] = new patternList("4:2:1:0:let|_id(0,1)|circle|center|_id(1,1)|radius|_number(0):<_id(0,1,1,lower)>=Circle(<_id(1,1)>,<_number(0)>)");
            pattern[pattern.length] = new patternList("2:1:0:0:delete|point|_id(0,1):Delete(<_id(0,1)>)");
            pattern[pattern.length] = new patternList("3:1:1:0:set|point|_id(0,1)|size|_number(0):SetPointSize(<_id(0,1)>, <_number(0)>)");
            pattern[pattern.length] = new patternList("4:1:0:0:paint|point|_id(0,1)|in|_color(0):SetColor(<_id(0,1)>, <_color(0)>)");
            pattern[pattern.length] = new patternList("4:1:1:0:move|point|_id(0,1)|up|to|_number(0):SetCoords(<_id(0,1)>,<_id(0,1).currX>,<<_id(0,1).currY>+<_number(0)>>)");
            pattern[pattern.length] = new patternList("4:1:1:0:move|point|_id(0,1)|right|to|_number(0):SetCoords(<_id(0,1)>,<<_id(0,1).currX>+<_number(0)>>,<_id(0,1).currY>)");
            pattern[pattern.length] = new patternList("4:1:1:0:move|point|_id(0,1)|down|to|_number(0):SetCoords(<_id(0,1)>,<_id(0,1).currX>,<<_id(0,1).currY>-<_number(0)>>)");
            pattern[pattern.length] = new patternList("4:1:1:0:move|point|_id(0,1)|left|to|_number(0):SetCoords(<_id(0,1)>,<<_id(0,1).currX>-<_number(0)>>,<_id(0,1).currY>)");
            pattern[pattern.length] = new patternList("2:1:0:0:let|_id(0,4)|quadrilateral:<_id(0,1,1,lower)>=Polygon(<_id(0,1,1)>,<_id(0,1,2)>,<_id(0,1,3)>,<_id(0,1,4)>)");
            pattern[pattern.length] = new patternList("2:0:0:1:let|_list(0,n,1)|points:<_list(0,i,1)>=(<_X,_Y>)");
            pattern[pattern.length] = new patternList("2:0:0:1:let|_list(0,n,3)|triangles:<_list(0,i,1,1,lower)>=Polygon(<_list(0,i,1,1)>,<_list(0,i,1,2)>,<_list(0,i,1,3)>)");
            pattern[pattern.length] = new patternList("2:0:0:1:let|_list(0,n,4)|quadrilaterals:<_list(0,i,1,1,lower)>=Polygon(<_list(0,i,1,1)>,<_list(0,i,1,2)>,<_list(0,i,1,3)>,<_list(0,i,1,4)>)");
            pattern[pattern.length] = new patternList("2:1:0:0:let|point|_id(0,1):<_id(0,1)>=(<_X,_Y>)");
            countp = pattern.length;
        }
    }
    if (lang == 1) {
        if (metd == 0) {
            keywords.clear();
            colors.clear();
            pattern = [];
            keywords.parseFromString("дан дана даны поставить в на чуть вверх вправо вниз влево выше правее ниже левее удалить подвинуть перекрасить");
            keywords.parseFromString("точка точки точке точку прямая прямые отрезок отрезка середина треугольник треугольники цвет круг радиусом радиуса радиус центром четырехугольник четырехугольники");
            keywords.parseFromString("бирюзовый черный чёрный синий голубой розовый серый серебряный зеленый зелёный красный белый желтый жёлтый оранжевый фиолетовый"); // colors as keywords
            colors.parseFromString("бирюзовый черный чёрный синий голубой розовый серый серебряный зеленый зелёный красный белый желтый жёлтый оранжевый фиолетовый");
            pattern[pattern.length] = new patternList("2:1:0:0:дана|точка|_id(0,1):<_id(0,1)>=(<_X,_Y>)");
            pattern[pattern.length] = new patternList("2:1:0:0:дана|прямая|_id(0,2):<_id(0,1,1,lower)>=Line(<_id(0,1,1)>,<_id(0,1,2)>)");
            pattern[pattern.length] = new patternList("2:1:0:0:дан|отрезок|_id(0,2):<_id(0,1,1,lower)>=Segment(<_id(0,1,1)>,<_id(0,1,2)>)");
            pattern[pattern.length] = new patternList("3:2:0:0:дана|середина|_id(0,1)|отрезка|_id(1,2):<_id(0,1)>=Midpoint(<_id(1,1,1)>,<_id(1,1,2)>)");
            pattern[pattern.length] = new patternList("3:1:0:0:дана|середина|отрезка|_id(1,2):<_newid(0)>=Midpoint(<_id(1,1,1)>,<_id(1,1,2)>)");
            pattern[pattern.length] = new patternList("2:1:0:0:дан|треугольник|_id(0,3):<_id(0,1,1,lower)>=Polygon(<_id(0,1,1)>,<_id(0,1,2)>,<_id(0,1,3)>)");
            pattern[pattern.length] = new patternList("4:2:1:0:дан|круг|_id(0,1)|центром|_id(1,1)|радиусом|_number(0):<_id(0,1,1,lower)>=Circle(<_id(1,1)>,<_number(0)>)");
            pattern[pattern.length] = new patternList("2:1:0:0:удалить|точку|_id(0,1):Delete(<_id(0,1)>)");
            pattern[pattern.length] = new patternList("3:1:1:0:поставить|точке|_id(0,1)|радиус|_number(0):SetPointSize(<_id(0,1)>, <_number(0)>)");
            pattern[pattern.length] = new patternList("5:1:0:0:перекрасить|точку|_id(0,1)|в|_color(0)|цвет:SetColor(<_id(0,1)>, <_color(0)>)");
            pattern[pattern.length] = new patternList("4:1:1:0:подвинуть|точку|_id(0,1)|вверх|на|_number(0):SetCoords(<_id(0,1)>,<_id(0,1).currX>,<(<_id(0,1).currY>)+(<_number(0)>)>)");
            pattern[pattern.length] = new patternList("4:1:1:0:подвинуть|точку|_id(0,1)|вправо|на|_number(0):SetCoords(<_id(0,1)>,<(<_id(0,1).currX>)+(<_number(0)>)>,<_id(0,1).currY>)");
            pattern[pattern.length] = new patternList("4:1:1:0:подвинуть|точку|_id(0,1)|вниз|на|_number(0):SetCoords(<_id(0,1)>,<_id(0,1).currX>,<(<_id(0,1).currY>)-(<_number(0)>)>)");
            pattern[pattern.length] = new patternList("4:1:1:0:подвинуть|точку|_id(0,1)|влево|на|_number(0):SetCoords(<_id(0,1)>,<(<_id(0,1).currX>)-(<_number(0)>)>,<_id(0,1).currY>)");
            pattern[pattern.length] = new patternList("2:1:0:0:дан|четырехугольник|_id(0,4):<_id(0,1,1,lower)>=Polygon(<_id(0,1,1)>,<_id(0,1,2)>,<_id(0,1,3)>,<_id(0,1,4)>)");
            pattern[pattern.length] = new patternList("2:0:0:1:даны|точки|_list(0,n,1):<_list(0,i,1)>=(<_X,_Y>)");
            pattern[pattern.length] = new patternList("2:0:0:1:даны|прямые|_list(0,n,2):<_list(0,i,1,1,lower)>=Line(<_list(0,i,1,1)>,<_list(0,i,1,2)>)");
            pattern[pattern.length] = new patternList("2:0:0:1:даны|треугольники|_list(0,n,3):<_list(0,i,1,1,lower)>=Polygon(<_list(0,i,1,1)>,<_list(0,i,1,2)>,<_list(0,i,1,3)>)");
            pattern[pattern.length] = new patternList("2:0:0:1:даны|четырехугольники|_list(0,n,4):<_list(0,i,1,1,lower)>=Polygon(<_list(0,i,1,1)>,<_list(0,i,1,2)>,<_list(0,i,1,3)>,<_list(0,i,1,4)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:чуть|выше:SetCoords(<_lastfig>,<_lastfig.currX>,<(<_lastfig.currY>)+(<_littlenum>)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:чуть|правее:SetCoords(<_lastfig>,<(<_lastfig.currX>)+(<_littlenum>)>,<_lastfig.currY>)");
            pattern[pattern.length] = new patternList("2:0:0:0:чуть|ниже:SetCoords(<_lastfig>,<_lastfig.currX>,<(<_lastfig.currY>)-(<_littlenum>)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:чуть|левее:SetCoords(<_lastfig>,<(<_lastfig.currX>)-(<_littlenum>)>,<_lastfig.currY>)");
            pattern[pattern.length] = new patternList("2:0:0:0:дана|точка:<_newid(0)>=(<_X,_Y>)");
            pattern[pattern.length] = new patternList("2:0:0:0:дана|прямая:<_newidlow(0)>=Line(<_newid(1)>,<_newid(2)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:дан|отрезок:<_newidlow(0)>=Segment(<_newid(1)>,<_newid(2)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:дан|треугольник:<_newidlow(0)>=Polygon(<_newid(1)>,<_newid(2)>,<_newid(3)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:дан|четырехугольник:<_newidlow(0)>=Polygon(<_newid(1)>,<_newid(2)>,<_newid(3)>,<_newid(4)>)");
            pattern[pattern.length] = new patternList("3:0:1:0:дан|круг|радиуса|_number(0):<_newidlow(0)>=Circle(<_newid(1)>,<_number(0)>)");
            countp = pattern.length;
        }
        if (metd == 1) {
            keywords.clear();
            colors.clear();
            pattern = [];
            keywords.parseFromString("поставить в на чуть вверх вправо вниз влево выше правее ниже левее удалить подвинуть перекрасить");
            keywords.parseFromString("точка точки точке точку прямая прямые отрезок отрезка середина треугольник треугольники цвет круг окружность радиусом радиуса радиус центром четырехугольник четырехугольники");
            keywords.parseFromString("бирюзовый черный чёрный синий голубой розовый серый серебряный зеленый зелёный красный белый желтый жёлтый оранжевый фиолетовый"); // colors as keywords
            colors.parseFromString("бирюзовый черный чёрный синий голубой розовый серый серебряный зеленый зелёный красный белый желтый жёлтый оранжевый фиолетовый");
            pattern[pattern.length] = new patternList("1:1:0:0:точка|_id(0,1):<_id(0,1)>=(<_X,_Y>)");
            pattern[pattern.length] = new patternList("1:1:0:0:прямая|_id(0,2):<_id(0,1,1,lower)>=Line(<_id(0,1,1)>,<_id(0,1,2)>)");
            pattern[pattern.length] = new patternList("1:1:0:0:отрезок|_id(0,2):<_id(0,1,1,lower)>=Segment(<_id(0,1,1)>,<_id(0,1,2)>)");
            pattern[pattern.length] = new patternList("2:2:0:0:_id(0,1)|середина|отрезка|_id(1,2):<_id(0,1)>=Midpoint(<_id(1,1,1)>,<_id(1,1,2)>)");
            pattern[pattern.length] = new patternList("2:2:0:0:середина|_id(0,1)|отрезка|_id(1,2):<_id(0,1)>=Midpoint(<_id(1,1,1)>,<_id(1,1,2)>)");
            pattern[pattern.length] = new patternList("2:1:0:0:середина|отрезка|_id(0,2):<_newid(0)>=Midpoint(<_id(0,1,1)>,<_id(0,1,2)>)");
            pattern[pattern.length] = new patternList("1:1:0:0:треугольник|_id(0,3):<_id(0,1,1,lower)>=Polygon(<_id(0,1,1)>,<_id(0,1,2)>,<_id(0,1,3)>)");
            pattern[pattern.length] = new patternList("3:2:1:0:круг|_id(0,1)|центром|_id(1,1)|радиусом|_number(0):<_id(0,1,1,lower)>=Circle(<_id(1,1)>,<_number(0)>)");
            pattern[pattern.length] = new patternList("3:2:1:0:окружность|_id(0,1)|центром|_id(1,1)|радиусом|_number(0):<_id(0,1,1,lower)>=Circle(<_id(1,1)>,<_number(0)>)");
            pattern[pattern.length] = new patternList("2:1:0:0:удалить|точку|_id(0,1):Delete(<_id(0,1)>)");
            pattern[pattern.length] = new patternList("3:1:1:0:поставить|точке|_id(0,1)|радиус|_number(0):SetPointSize(<_id(0,1)>, <_number(0)>)");
            pattern[pattern.length] = new patternList("5:1:0:0:перекрасить|точку|_id(0,1)|в|_color(0)|цвет:SetColor(<_id(0,1)>, <_color(0)>)");
            pattern[pattern.length] = new patternList("4:1:1:0:подвинуть|точку|_id(0,1)|вверх|на|_number(0):SetCoords(<_id(0,1)>,<_id(0,1).currX>,<(<_id(0,1).currY>)+(<_number(0)>)>)");
            pattern[pattern.length] = new patternList("4:1:1:0:подвинуть|точку|_id(0,1)|вправо|на|_number(0):SetCoords(<_id(0,1)>,<(<_id(0,1).currX>)+(<_number(0)>)>,<_id(0,1).currY>)");
            pattern[pattern.length] = new patternList("4:1:1:0:подвинуть|точку|_id(0,1)|вниз|на|_number(0):SetCoords(<_id(0,1)>,<_id(0,1).currX>,<(<_id(0,1).currY>)-(<_number(0)>)>)");
            pattern[pattern.length] = new patternList("4:1:1:0:подвинуть|точку|_id(0,1)|влево|на|_number(0):SetCoords(<_id(0,1)>,<(<_id(0,1).currX>)-(<_number(0)>)>,<_id(0,1).currY>)");
            pattern[pattern.length] = new patternList("1:1:0:0:четырехугольник|_id(0,4):<_id(0,1,1,lower)>=Polygon(<_id(0,1,1)>,<_id(0,1,2)>,<_id(0,1,3)>,<_id(0,1,4)>)");
            pattern[pattern.length] = new patternList("1:0:0:1:точки|_list(0,n,1):<_list(0,i,1)>=(<_X,_Y>)");
            pattern[pattern.length] = new patternList("1:0:0:1:прямые|_list(0,n,2):<_list(0,i,1,1,lower)>=Line(<_list(0,i,1,1)>,<_list(0,i,1,2)>)");
            pattern[pattern.length] = new patternList("1:0:0:1:треугольники|_list(0,n,3):<_list(0,i,1,1,lower)>=Polygon(<_list(0,i,1,1)>,<_list(0,i,1,2)>,<_list(0,i,1,3)>)");
            pattern[pattern.length] = new patternList("1:0:0:1:четырехугольники|_list(0,n,4):<_list(0,i,1,1,lower)>=Polygon(<_list(0,i,1,1)>,<_list(0,i,1,2)>,<_list(0,i,1,3)>,<_list(0,i,1,4)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:чуть|выше:SetCoords(<_lastfig>,<_lastfig.currX>,<(<_lastfig.currY>)+(<_littlenum>)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:чуть|правее:SetCoords(<_lastfig>,<(<_lastfig.currX>)+(<_littlenum>)>,<_lastfig.currY>)");
            pattern[pattern.length] = new patternList("2:0:0:0:чуть|ниже:SetCoords(<_lastfig>,<_lastfig.currX>,<(<_lastfig.currY>)-(<_littlenum>)>)");
            pattern[pattern.length] = new patternList("2:0:0:0:чуть|левее:SetCoords(<_lastfig>,<(<_lastfig.currX>)-(<_littlenum>)>,<_lastfig.currY>)");
            pattern[pattern.length] = new patternList("1:0:0:0:точка:<_newid(0)>=(<_X,_Y>)");
            pattern[pattern.length] = new patternList("1:0:0:0:прямая:<_newidlow(0)>=Line(<_newid(1)>,<_newid(2)>)");
            pattern[pattern.length] = new patternList("1:0:0:0:отрезок:<_newidlow(0)>=Segment(<_newid(1)>,<_newid(2)>)");
            pattern[pattern.length] = new patternList("1:0:0:0:треугольник:<_newidlow(0)>=Polygon(<_newid(1)>,<_newid(2)>,<_newid(3)>)");
            pattern[pattern.length] = new patternList("1:0:0:0:четырехугольник:<_newidlow(0)>=Polygon(<_newid(1)>,<_newid(2)>,<_newid(3)>,<_newid(4)>)");
            pattern[pattern.length] = new patternList("2:0:1:0:круг|радиуса|_number(0):<_newidlow(0)>=Circle(<_newid(1)>,<_number(0)>)");
            pattern[pattern.length] = new patternList("2:0:1:0:окружность|радиуса|_number(0):<_newidlow(0)>=Circle(<_newid(1)>,<_number(0)>)");
            
            countp = pattern.length;
            
            setPriority(25, 0);
            setPriority(26, 1);
            setPriority(27, 2);
            setPriority(28, 6);
            setPriority(29, 16);
            setPriority(5, 3);
        }
    }
    
    oldlang = lang;
    return true;
}

function isNum(s) {
    var f;
    var i, k;

    var isnum_result;
    s = s.replaceAll(",", ".");
    f = true;
    if (s != "") {
        for (i = 0; i < s.length; i ++) {
            if (!inNum(s[i])) {
                f = false;
            }
        }
        if (f) {
            isnum_result = true;
        }
        else {
            k = strPos('.', s);
            if (k != -1) {
                s = strDelete(s, k, 1);
                k = strPos('.', s);
                isnum_result = (k == -1);
            }
            else {
                isnum_result = false;
            }
        }
    }
    else {
        isnum_result = false;
    }
    return isnum_result;
}

function isColor(s) {
    var iscolor_result = 0;
    iscolor_result = member(s, colors);
    return iscolor_result;
}

function member(s, a) {
    var member_result;
    member_result = false;
    for (var i = 0; i < a.count(); i++) {
        if (a.words[i] == s) {
            member_result = true;
            break;
        }
    }
    return member_result;
}

function countKeys(a) {
    var res = [];
    var k = 0, i = 0, n = 0, l = 0;
    for (var p = 0; p < a.count(); p++) {
        if (member(a.words[p], keywords)) k += 1;
        if (isId(a.words[p])) i += 1;
        if (isNum(a.words[p])) n += 1;
        if (isList(a.words[p])) l += 1;
    }
    res[0] = k;
    res[1] = i;
    res[2] = n;
    res[3] = l;
    return res;
}

// function, which determines pattern from given list a
function recognizePattern(a) {
    var k, i, n, l, p, q, r, t;
    var f;
    var v = "", z = "";
    var pat = "";

    r = countKeys(a);
    k = r[0];
    i = r[1];
    n = r[2];
    l = r[3];
    currentids.clear();
    currentlists.clear();
    currentcolors.clear();
    currentnumbers.clear();
    for (p = 0; p < countp; p ++) {
        if ((pattern[p].keys == k) && (pattern[p].ids == i) && (pattern[p].numbers == n) && (pattern[p].lists == l)) {
            r = 0;
            f = true;
            for (q = 0; q < pattern[p].count(); q++) {
                if (pattern[p].words[q][0] == '_') {
                    while ((r < a.count() - 1) && (!isId(a.words[r])) && (!isColor(a.words[r]) && (!isNum(a.words[r])) && (!isList(a.words[r])))) {
                        r += 1;
                        if (r == a.count()) break;
                    }
                    if (subString("_id", pattern[p].words[q]) && isId(a.words[r])) {
                        currentids.add(a.words[r]);
                    }
                    else {
                        if (subString("_color", pattern[p].words[q]) && isColor(a.words[r])) {
                            currentcolors.add(a.words[r]);
                        }
                        else {
                            if (subString("_number", pattern[p].words[q]) && isNum(a.words[r])) {
                                currentnumbers.add(a.words[r]);
                            }
                            else {
                                if (subString("_list", pattern[p].words[q]) && isList(a.words[r])) {
                                    currentlists.add(a.words[r]);
                                }
                                else {
                                    f = false;
                                }
                            }
                        }
                    }
                }
                else {
                    while ((!(pattern[p].words[q] == a.words[r])) && (r != a.count() - 1)) {
                        r += 1;
                    }
                    if (!(pattern[p].words[q] == a.words[r])) {
                        f = false;
                    }
                }
            }
            if (f) {
                pat = pattern[p].answer;
                break;
            }
        }
    }
    return pat;
}

// function, which determines number of pattern from given list a
function recognizePatternNum(a) {
    var k, i, n, l, p, q, r, t;
    var f;
    var v = "", z = "";
    
    var ans = -1;

    r = countKeys(a);
    k = r[0];
    i = r[1];
    n = r[2];
    l = r[3];
    for (p = 0; p < countp; p ++) {
        if ((pattern[p].keys == k) && (pattern[p].ids == i) && (pattern[p].numbers == n) && (pattern[p].lists == l)) {
            r = 0;
            f = true;
            for (q = 0; q < pattern[p].count(); q++) {
                if (pattern[p].words[q][0] == '_') {
                    while ((r < a.count() - 1) && (!isId(a.words[r])) && (!isColor(a.words[r]) && (!isNum(a.words[r])) && (!isList(a.words[r])))) {
                        r += 1;
                        if (r == a.count()) break;
                    }
                    if (!((subString("_id", pattern[p].words[q]) && isId(a.words[r])) ||
                        (subString("_color", pattern[p].words[q]) && isColor(a.words[r])) ||
                        (subString("_number", pattern[p].words[q]) && isNum(a.words[r])) ||
                        (subString("_list", pattern[p].words[q]) && isList(a.words[r])))) {
                        f = false;
                    }
                }
                else {
                    while ((!(pattern[p].words[q] == a.words[r])) && (r != a.count() - 1)) {
                        r += 1;
                    }
                    if (!(pattern[p].words[q] == a.words[r])) {
                        f = false;
                    }
                }
            }
            if (f) {
                ans = p;
                break;
            }
        }
    }
    return ans;
}

function incId(s) {
    var i, p, n;
    var complete;
    var v;
    p = strPos('_', s);
    if (p == -1) {
        s = s + "_1";
    }
    else {
        v = strCopy(s, p + 1, s.length - p - 1);
        s = strDelete(s, p + 1, s.length - p - 1);
        n = parseInt(v);
        n += 1;
        s = s + parseInt(n);
    }
    return s;
}

function existId(id) {
    var res = false;
    for (var i = 0; i < usedids.count(); i++) {
        if (id == usedids.words[i]) {
            res = true;
            break;
        }
    }
    return res;
}

function existIdGGB(id) {
    var res = false;
    var length = ggb.getObjectNumber();
    var nm = "";
    for (var j = 0; j < length; j++) {
        nm = ggb.getObjectName(j);
        if (id == nm) {
            res = true;
            break;
        }
    }
    return res;
}

function nextId(id) {
    var res = "";
    if (id.length == 1) {
        if (id.toLowerCase() == "z") {
            if (id == "z") res = "a_1";
            else res = "A_1";
        }
        else {
            res = nextLetter(id);
        }
    }
    else {
        if (id[0].toLowerCase() == "z") {
            var t1 = parseInt(id[2]);
            if (id[0] == "z") res = "a_" + parseInt(t1 + 1);
            else res = "A_" + parseInt(t1 + 1);
        }
        else {
            var t = strCopy(id, 0, 1);
            t = nextLetter(t);
            id = strDelete(id, 0, 1);
            res = t + id;
        }
    }
    return res;
}

// function, which puts given GeoGebra Command in the database and corrects it
function parseAsObject(s) {
    var i, l, r, p, countlbrackets, countrbrackets, countcommas, counteqs;
    var id, newid, inbrackets, inb, p1, leftid, rightid, objtype, v, nm, t;
    var objexists, objseq, firsteq, secondeq;
    var res = s;

    countlbrackets = 0;
    countrbrackets = 0;
    countcommas = 0;
    counteqs = 0;
    if (subString("line", res.toLowerCase())) objtype = "line";
    else if (subString("segment", res.toLowerCase())) objtype = "segment";
    else if (subString("polygon", res.toLowerCase())) objtype = "polygon";
    else if (subString("midpoint", res.toLowerCase())) objtype = "midpoint";
    for (i = 0; i < s.length; i++) {
        if (s[i] == '(') countlbrackets += 1;
        if (s[i] == ')') countrbrackets += 1;
        if (s[i] == ',') countcommas += 1;
        if (s[i] == '=') counteqs += 1;
    }
    if ((countlbrackets == 1) && (countrbrackets == 1) && (counteqs == 1)) {
        objexists = false;
        objseq = false;
        firsteq = false;
        secondeq = false;
        p = strPos('=', s);
        id = strCopy(s, 0, p);
        newid = id;
        l = strPos('(', s);
        r = strPos(')', s);
        inbrackets = strCopy(s, l + 1, r - l - 1);
        inb = inbrackets;
        i = strPos(',', inbrackets);
        leftid = strCopy(inbrackets, 0, i);
        inbrackets = strDelete(inbrackets, 0, i + 1);
        rightid = inbrackets;
        for (var k = 0; k < countobjects; k++) {
            p1 = obj[k].points[0];
            for (var j = 1; j < obj[k].countPoints(); j++) {
                p1 = p1 + "," + obj[k].points[j];
            }
            if ((p1 == inb) && (objtype == obj[k].objType)) {
                objexists = true;
                break;
            }
        }
        if (objexists) {
            objseq = true;
            res = "";
        }
        else {
            while (existId(newid) || existIdGGB(newid)) newid = incId(newid);
            var t = strPos("=", res);
            res = strDelete(res, 0, t);
            res = newid + res;
        }
        if (!objseq) {
            obj[countobjects] = new myObject(objtype, newid);
            usedids.add(newid);
            i = strPos(',', inb);
            while (i != -1) {
                id = strCopy(inb, 0, i);
                if (isId(id) && (!pointExists(id))) {
                    t = id + "=(<_X,_Y>)";
                    parseCommand(t);
                }
                obj[countobjects].addPoint(id);
                inb = strDelete(inb, 0, i + 1);
                i = strPos(',', inb);
            }
            obj[countobjects].addPoint(inb);
            if (isId(inb) && (!pointExists(inb))) {
                inb = inb + "=(<_X,_Y>)";
                parseCommand(inb);
            }
            countobjects++;
        }
    }
    return res;
}

function pointExists(s) {
    var i;
    var ptexists = false;
    
    i = strPos('=', s);
    if (i != -1) {
        s = strCopy(s, 0, i);
    }
    var length = ggb.getObjectNumber();
    var nm = "";
    for (var j = 0; j < length; j++) {
        nm = ggb.getObjectName(j);
        if ((s == nm) && (ggb.getObjectType(nm) == "point")) {
            ptexists = true;
            break;
        }
    }
    return ptexists;
}

function isRational(s) {
    var i, countdots;
    var flag;

    var isrational_result;
    flag = true;
    countdots = 0;
    if (inAlphaForRationals(s[0]) || (s[0] == "-")) {
        for (i = 1; i < s.length; i ++) {
            if (s[i] == '.') countdots += 1;
            if (!inAlphaForRationals(s[i])) {
                flag = false;
            }
        }
        if (flag && (countdots == 1)) {
            if ((strPos('.', s) == 0) || (strPos('.', s) == (s.length - 1))) {
                flag = false;
            }
        }
    }
    isrational_result = flag;
    return isrational_result;
}

function isPointCommand(v) {
    var i, l, r;
    var countlbrackets, countrbrackets, countcommas;
    var inbrackets, id, leftnum, rightnum;
    var id, leftnum_, rightnum_;
    var res = [];

    var ispointcommand_result;
    ispointcommand_result = false;
    countlbrackets = 0;
    countrbrackets = 0;
    countcommas = 0;
    inbrackets = "";
    id = "";
    leftnum = "";
    rightnum = "";
    for (i = 0; i < v.length; i ++) {
        if (v[i] == '(') countlbrackets += 1;
        if (v[i] == ')') countrbrackets += 1;
        if (v[i] == ',') countcommas += 1;
    }
    if ((countlbrackets == 1) && (countrbrackets == 1) && (countcommas == 1)) {
        l = strPos('(', v);
        r = strPos(')', v);
        inbrackets = strCopy(v, l + 1, r - l - 1);
        i = strPos('=', v);
        id = strCopy(v, 0, i);
        i = strPos(',', inbrackets);
        leftnum = strCopy(inbrackets, 0, i);
        inbrackets = strDelete(inbrackets, 0, i + 1);
        rightnum = inbrackets;
        if (isId(id) && isRational(leftnum) && isRational(rightnum) && (v == (id + "=(" + leftnum + "," + rightnum + ")"))) {
            ispointcommand_result = true;
        }
    }
    return ispointcommand_result;
}

function isCorrectPoint(v) {
    var i, l, r;
    var inb, x, y;
    var res = false;

    l = strPos('(', v);
    r = strPos(')', v);
    inb = strCopy(v, l + 1, r - l - 1);
    i = strPos(',', inb);
    x = parseInt(strCopy(inb, 0, i));
    inb = strDelete(inb, 0, i + 1);
    y = parseInt(inb);
    if ((x1 <= x) && (x <= x2) && (y1 <= y) && (y <= y2)) {
        res = true;
    }
    return res;
}

function addPoint(v) {
    var i;
    var id;
    
    i = strPos('=', v);
    id = strCopy(v, 0, i);
    usedids.add(id);
}

function identificator(currentid, arn, num, reg) {
    var i, k, p, count;
    var f;
    var s, v;

    var identificator_result;
    s = "";
    count = 0;
    i = 0;
    while ((count != num) && (i <= currentid.length)) {
        p = ((currentid[i] >= 'A') && (currentid[i] <= 'Z'));
        count += p;
        i += 1;
    }
    i -= 1;
    k = i;
    while ((k < currentid.length) && ((currentid[k + 1] >= '0') && (currentid[k + 1] <= '9')) || (currentid[k + 1] == '_')) {
        k += 1;
    }
    if (count == num) {
        s = strCopy(currentid, i, k - i + 1);
        if (reg) {
            s = s.toLowerCase();
        }
    }
    identificator_result = s;
    return identificator_result;
}

function getRandom() {
    return Math.random();
}

function getRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function countPoints() {
    var length = ggb.getObjectNumber();
    var res = 0;
    for (j = 0; j < length; j++) {
        nm = ggb.getObjectName(j);
        if (ggb.getObjectType(nm) == "point") {
            res++;
        }
    }
    return res;
}

// function, which returns the coordinates for new point
function createPointCoords() {
    var f;
    var i, j, r;
    var vectx, vecty;
    var x = [], y = [];
    var eps, stepx, stepy;
    var flag;
    var x0, y0;

    flag = true;
    stepx = (x2 - x1) / 5;
    stepy = (y2 - y1) / 5;
    x[0] = stepx * 2;
    y[0] = stepy * 2;
    vectx = 0;
    vecty = 1;
    for (i = 1; i < 25; i++) {
        x[i] = x[i - 1] + stepx * vectx;
        y[i] = y[i - 1] + stepy * vecty;
        if (i == 1) { vectx = 1; vecty = 0; }
        if (i == 2) { vectx = 0; vecty = -1; }
        if (i == 4) { vectx = -1; vecty = 0; }
        if (i == 6) { vectx = 0; vecty = 1; }
        if (i == 9) { vectx = 1; vecty = 0; }
        if (i == 12) { vectx = 0; vecty = -1; }
        if (i == 16) { vectx = -1; vecty = 0; }
        if (i == 20) { vectx = 0; vecty = 1; }
    }
    for (i = 0; i < 25; i++) {
        x[i] = x[i] + x1 + stepx / 2;
        y[i] = y[i] + y1 + stepx / 2;
    }
    eps = stepx;
    var P = [];
    var length = ggb.getObjectNumber();
    var nm = "";
    var cntpts = 0;
    for (j = 0; j < length; j++) {
        nm = ggb.getObjectName(j);
        if (ggb.getObjectType(nm) == "point") {
            P[cntpts] = {
                x: 0,
                y: 0
            }
            P[cntpts].x = ggb.getXcoord(nm);
            P[cntpts].y = ggb.getYcoord(nm);
            cntpts++;
        }
    }
    if (eps < stepy) eps = stepy;
    if (countPoints() == 0) i = 0;
    if ((countPoints() > 0) && (countPoints() <= 5)) {
        while (flag) {
            flag = false;
            i = getRandomInt(0, 8);
            for (j = 0; j < cntpts; j++) {
                if ((Math.abs(P[j].x - x[i]) < stepx / 2) && (Math.abs(P[j].y - y[i]) < stepy / 2)) {
                    flag = true;
                }
            }
        }
    }
    if ((countPoints() > 5) && (countPoints() <= 24)) {
        while (flag) {
            flag = false;
            i = getRandomInt(0, 24);
            for (j = 0; j < cntpts; j++) {
                if ((Math.abs(P[j].x - x[i]) < stepx / 2) && (Math.abs(P[j].y - y[i]) < stepy / 2)) {
                    flag = true;
                }
            }
        }
    }
    x0 = roundPlus(x[i] + stepx * (Math.random() - 0.5) / 2, 1);
    y0 = roundPlus(y[i] + stepy * (Math.random() - 0.5) / 2, 1);
    var res = [];
    res[0] = x0;
    res[1] = y0;
    if (countPoints() > 24) {
        res[0] = -10000000;
        res[1] = -10000000;
    }
    return res;
}

function operationStrExpr(s) {
    var i = 0, cnt = 0;
    var res = "";
    
    while (i < s.length) {
        if (s[i] == "(") cnt++;
        if (s[i] == ")") cnt--;
        if (((s[i] == "+") || (s[i] == "-") || (s[i] == "*") || (s[i] == "/")) && (cnt == 0)) {
            res = s[i];
        }
        i++;
    }
    return res;
}

function operandsStrExpr(s) {
    var i = 0, cnt = 0, l = 0, r = 0;
    var res = [];
    var left = "", right = "";
    
    while (i < s.length) {
        if (s[i] == "(") l = i + 1;
        if (s[i] == ")") {
            r = i - 1;
            left = strCopy(s, l, r - l + 1);
            break;
        }
        i++;
    }
    i++;
    while (i < s.length) {
        if (s[i] == "(") l = i + 1;
        if (s[i] == ")") {
            r = i - 1;
            right = strCopy(s, l, r - l + 1);
            break;
        }
        i++;
    }
    res[0] = parseFloat(left);
    res[1] = parseFloat(right);
    return res;
}

function deleteObject(n) {
    var i, j, k;
    var A = new Array();
    if (countobjects > 1) {
        for (i = n; i < countobjects - 1; i++) {
            obj[i] = obj[i + 1];
        }
        countobjects--;
    }
    else {
        if (n == 0) {
            obj[0] = 0;
            countobjects = 0;
        }
    }
}

function deletePoint(arg) {
    var i, j, k;
    var A = new Array();
    for (i = 0; i < countobjects; i++) {
        for (k = 0; k < obj[i].countPoints(); k++) {
            if (obj[i].points[k] == arg) A[A.length] = i;
        }
    }
    for (i = A.length - 1; i > -1; i--) {
        deleteObject(A[i]);
    }
}

function convertColorInRussian(v) {
    if (v == "желтый") {
        v = "жёлтый";
    }    if (v == "зеленый") {
        v = "зелёный";
    }    if (v == "черный") {
        v = "чёрный";
    }
    return v;
}

// function, which returns GeoGebra Command string by pattern s
function recognizeAnswer(s) {
    var i, l, r, id, arn, num, z, z1, ptpos, cnt;
    var x0, y0, eps, rat, left, right, coord;
    var v, p, ans2, meth;
    var c;
    var reg, flag, pointexists;

    while (subString('<', s)) {
        l = strPos('<', s);
        i = l + 1;
        cnt = 1;
        while (cnt != 0) {
            if (s[i] == '<') cnt += 1;
            if (s[i] == '>') cnt -= 1;
            i += 1;
        }
        r = i - 1;
        v = strCopy(s, l + 1, r - l - 1);
        p = strCopy(s, l, r - l + 1);
        if (subString('<', v)) {
            ans2 = "";
            ans2 = recognizeAnswer(v);
            if (subString('+', ans2) || subString('-', ans2) || subString('*', ans2) || subString('/', ans2)) {
                c = operationStrExpr(ans2);
                ans2 = operandsStrExpr(ans2);
                left = ans2[0];
                right = ans2[1];
                switch (c) {
                    case '+': ans2 = roundPlus(left + right, 1); break;
                    case '-': ans2 = roundPlus(left - right, 1); break;
                    case '*': ans2 = roundPlus(left * right, 1); break;
                    case '/': ans2 = roundPlus(left / right, 1);
                    break;
                }
            }
            s = s.replaceAll(p, ans2);
        }
        else {
            if (subString("_id", v)) {
                id = 0;
                arn = 1;
                num = 1;
                reg = false;
                ptpos = strPos('.', v);
                meth = "";
                if (ptpos != -1) {
                    meth = strCopy(v, ptpos + 1, v.length - ptpos - 1);
                }
                l = strPos('(', v);
                r = strPos(')', v);
                v = strCopy(v, l + 1, r - l - 1);
                l = strPos(',', v);
                id = parseInt(strCopy(v, 0, l));
                v = strDelete(v, 0, l + 1);
                l = strPos(',', v);
                if (l != -1) {
                    arn = parseInt(strCopy(v, 0, l));
                    v = strDelete(v, 0, l + 1);
                }
                else {
                    arn = parseInt(v);
                    v = "";
                }
                if (v != "") {
                    l = strPos(',', v);
                    if (l != -1) {
                        num = parseInt(strCopy(v, 0, l));
                        v = strDelete(v, 0, l + 1);
                    }
                    else {
                        num = parseInt(v);
                        v = "";
                    }
                    if (v != "") {
                        if (v == "lower") reg = true;
                        if (v == "upper") reg = false;
                    }
                }
                v = identificator(currentids.words[id], arn, num, reg);
                lastpnt = v;
                if (meth != "") {
                    if (meth == "currX") {
                        v = ggb.getXcoord(v);
                    }
                    if (meth == "currY") {
                        v = ggb.getYcoord(v);
                    }
                }
                s = s.replaceAll(p, v);
            }
            if (subString("_color", v)) {
                l = strPos('(', v);
                r = strPos(')', v);
                v = strCopy(v, l + 1, r - l - 1);
                id = parseInt(v);
                v = currentcolors.words[id];
                v = convertColorInRussian(v);
                s = s.replaceAll(p, v);
            }
            if (subString("_number", v)) {
                l = strPos('(', v);
                r = strPos(')', v);
                v = strCopy(v, l + 1, r - l - 1);
                id = parseInt(v);
                v = currentnumbers.words[id];
                v = v.replaceAll(",", ".");
                s = s.replaceAll(p, v);
            }
            if (subString("_X,_Y", v)) {
                var crds = [];
                crds = createPointCoords();
                x0 = crds[0];
                y0 = crds[1];
                v = x0 + ',' + y0;
                s = s.replaceAll(p, v);
            }
            if (subString("_list", v)) {
                var z2 = "_list(";
                t = 0;
                id = 0;
                arn = 1;
                num = 1;
                reg = false;
                l = strPos('(', v);
                r = strPos(')', v);
                v = strCopy(v, l + 1, r - l - 1);
                l = strPos(',', v);
                t = strCopy(v, 0, l);
                z2 = z2 + t + ",";
                v = strDelete(v, 0, l + 1);
                l = strPos(',', v);
                id = strCopy(v, 0, l);
                if (id == 'n') {
                
                }
                else if (id == 'i') {
                
                }
                else {
                    id = parseInt(id);
                }
                z2 = z2 + id;
                v = strDelete(v, 0, l + 1);
                l = strPos(',', v);
                if (l != -1) {
                    arn = parseInt(strCopy(v, 0, l));
                    v = strDelete(v, 0, l + 1);
                }
                else {
                    arn = parseInt(v);
                    v = "";
                }
                if (v != "") {
                    l = strPos(',', v);
                    if (l != -1) {
                        num = parseInt(strCopy(v, 0, l));
                        v = strDelete(v, 0, l + 1);
                    }
                    else {
                        num = parseInt(v);
                        v = "";
                    }
                    if (v != "") {
                        if (v == "lower") reg = true;
                        if (v == "upper") reg = false;
                    }
                }
                z = currentlists.words[t];
                t = strPos('$', z);
                var curids = new wordList();
                var ccurids = 0;
                while (t != -1) {
                    v = strCopy(z, 0, t);
                    curids.add(v);
                    z = strDelete(z, 0, t + 1);
                    t = strPos('$', z);
                }
                curids.add(z);
                for (t = 0; t < curids.count() - 1; t++) {
                    z1 = s;
                    v = identificator(curids.words[t], arn, num, reg);
                    z1 = z1.replaceAll(p, v);
                    if (subString(z2, z1)) {
                        z1 = z1.replaceAll(z2, "_id(" + parseInt(currentids.count()));
                    }
                    currentids.add(curids.words[t]);
                    parseCommand(z1);
                }
                v = identificator(curids.words[curids.count() - 1], arn, num, reg);
                s = s.replaceAll(p, v);
                s = s.replaceAll(z2, "_id(" + parseInt(currentids.count()));
                currentids.add(curids.words[curids.count() - 1]);
            }
            if (subString("_lastfig", v)) {
                if (!pointislast) {
                    var z2 = "_lastfig";
                    var lastob = obj[countobjects - 1];
                    var curids = new wordList();
                    for (var t = 0; t < lastob.countPoints(); t++) {
                        curids.add(lastob.points[t]);
                    }
                    arn = 1;
                    num = 1;
                    reg = false;
                    for (t = 0; t < curids.count() - 1; t++) {
                        z1 = s;
                        v = identificator(curids.words[t], arn, num, reg);
                        z1 = z1.replaceAll(p, v);
                        if (subString(z2, z1)) {
                            z1 = z1.replaceAll(z2, "_id(" + parseInt(currentids.count()) + ",1)");
                        }
                        currentids.add(curids.words[t]);
                        parseCommand(z1);
                    }
                    v = identificator(curids.words[curids.count() - 1], arn, num, reg);
                    s = s.replaceAll(p, v);
                    s = s.replaceAll(z2, "_id(" + parseInt(currentids.count()) + ",1)");
                    currentids.add(curids.words[curids.count() - 1]);
                }
                else {
                    var z2 = "_lastfig";
                    s = s.replaceAll(p, lastpnt);
                    s = s.replaceAll(z2, "_id(" + parseInt(currentids.count()) + ",1)");
                    currentids.add(lastpnt);
                }
            }
            if (subString("_littlenum", v)) {
                v = littlenum;
                s = s.replaceAll(p, v);
            }
            if (subString("_newid", v)) {
                if (usedids.count() == 0) {
                    if (subString("low", v)) {
                        v = "a";
                    }
                    else {
                        v = "A";
                    }
                }
                else {
                    if (subString("low", v)) {
                        i = 0;
                        var z1 = usedids.words[i];
                        var n = usedids.count();
                        while (i < n) {
                            if (z1 == z1.toLowerCase()) break; 
                            i++;
                            z1 = usedids.words[i];
                        }
                        if (i == n) i = 0;
                        v = usedids.words[i];
                        for (var i = 1; i < usedids.count(); i++) {
                            if ((v < usedids.words[i]) && (usedids.words[i] == usedids.words[i].toLowerCase())) {
                                v = usedids.words[i];
                            }
                        }
                        if (v == v.toLowerCase()) {
                            v = "a";
                        }
                    }
                    else {
                        i = 0;
                        var z1 = usedids.words[i];
                        var n = usedids.count();
                        while (i < n) {
                            if (z1 != z1.toLowerCase()) break;
                            i++;
                            z1 = usedids.words[i];
                        }
                        if (i == n) i = 0;
                        v = usedids.words[i];
                        for (var i = 1; i < usedids.count(); i++) {
                            if ((v < usedids.words[i]) && (usedids.words[i] != usedids.words[i].toLowerCase())) {
                                v = usedids.words[i];
                            }
                        }
                        if (v == v.toLowerCase()) {
                            v = "A";
                        }
                    }
                    while (existId(v)) v = nextId(v);
                }
                usedids.add(v);
                if (v != v.toLowerCase()) {
                    lastpnt = v;
                }
                
                s = s.replaceAll(p, v);
            }
        }
    }
    if (subString("Delete", s)) {
        deletePoint(currentids.words[id]);
    }
    if (subString("error", s)) {
        s = "";
        alert("Error!");
        throw "MyError";
    }
    return s;
}

// function, which get GeoGebra Command by pattern v and adds it to the database
function parseCommand(v) {
    var ans;
    ans = recognizeAnswer(v);
    if (!isPointCommand(ans)) {
        pointislast = false;
        ans = parseAsObject(ans);
        if (ans != "") {
            ggb.evalCommand(ans);
            allcmds += ans + "<br>";
        }
    }
    else {
        pointislast = true;
        if (!pointExists(ans)) {
            if (isCorrectPoint(ans)) {
                addPoint(ans);
                ggb.evalCommand(ans);
                allcmds += ans + "<br>";
            }
        }
    }
    return true;
}

// function, which parse sentence in multi-pattern mode
function dynParser() {
    var lst = new wordList();
    var lsts = [];
    var lstsln = 0;
    var v = "";
    for (var i = 0; i < list.count(); i++) {
        v = list.words[i];
        if (member(v, keywords) || isId(v) || isNum(v) || isList(v)) {
            lst.add(v);
        }
    }
    for (var i = 0; i < lst.count(); i++) {
        for (var j = 0; j < lst.count() - i; j++) {
            lsts[lstsln] = {
                wrd: new wordList(),
                ptrn: 0,
                start: 0,
                end: 0
            }
            lsts[lstsln].start = i;
            lsts[lstsln].end = lst.count() - j;
            for (var k = i; k < lst.count() - j; k++) {
                lsts[lstsln].wrd.add(lst.words[k]); 
            }
            lsts[lstsln].ptrn = recognizePatternNum(lsts[lstsln].wrd);
            if (lsts[lstsln].ptrn != -1) {
                lstsln++;
            }
        }
    }
    for (var i = 0; i < lstsln; i++) {
        for (var j = i + 1; j < lstsln; j++) {
            if ((lsts[j].start >= lsts[i].start) && (lsts[j].end <= lsts[i].end)) {
                if (isLess(lsts[j].ptrn, lsts[i].ptrn)) {
                    lsts[j].ptrn = -1;
                }
            }
        }
    }
    for (var i = 0; i < lstsln; i++) {
        if (lsts[i].ptrn != -1) {
            v = recognizePattern(lsts[i].wrd);
            parseCommand(v);
        }
    }
}

// function, which process initial data directly from html forms
function runParser() {
    var form = document.myForm;
    var num = 0, i = 0;
    var radios = form.getElementsByTagName("input");
    for (var k = 0; k < radios.length; k++) {
        if (radios[k].type == "radio") {
            if (radios[k].checked) {
                num = k;
                break;
            }
        }
    }
    form = document.myForm1;
    radios = form.getElementsByTagName("input");
    for (var k = 0; k < radios.length; k++) {
        if (radios[k].type == "radio") {
            if (radios[k].checked) {
                lang = k;
                break;
            }
        }
    }
    form = document.myForm2;
    radios = form.getElementsByTagName("input");
    for (var k = 0; k < radios.length; k++) {
        if (radios[k].type == "radio") {
            if (radios[k].checked) {
                metd = k;
                break;
            }
        }
    }
    if (lang != oldlang) {
        main();
    }
    var form = document.myForm3;
    var s = form.inputfield.value;
    if (num == 0) {
        ggb.evalCommand(s);
    }
    if (num == 1) {
        var v;
        s = strReplaceEnters(s);
        i = strPos(".", s);
        while (i != -1) {
            v = strCopy(s, 0, i);
            s = strDelete(s, 0, i + 1);
            i = strPos(".", s);
            list.clear();
            list.parseFromString(v);
            if (metd == 0) {
                v = recognizePattern(list);
                if (v != "") {
                    parseCommand(v);
                }
            }
            if (metd == 1) {
                dynParser();
            }
        }
    }
}
