"""Original outline construction for the Random Stranger typeface.
No third-party font outlines are read or transformed.
Build dependencies: fonttools, shapely, brotli, Pillow.
"""
from pathlib import Path
import sys,math,re,unicodedata
import shapely
from shapely.geometry import Polygon,Point,LineString,box
from shapely.ops import unary_union
from shapely import affinity
from shapely.geometry.polygon import orient
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/fonts';OUT.mkdir(parents=True,exist_ok=True)
UPM=1000

def path(d):
 t=re.findall(r'[MLQCZ]|-?\d+(?:\.\d+)?',d);pts=[];i=0;p=(0,0);start=p
 while i<len(t):
  c=t[i];i+=1
  if c=='Z':pts.append(start);p=start;continue
  n={'M':2,'L':2,'Q':4,'C':6}[c];a=list(map(float,t[i:i+n]));i+=n
  if c in ['M','L']:
   p=tuple(a);pts.append(p)
   if c=='M':start=p
  else:
   origin=p;end=tuple(a[-2:]);steps=24
   for k in range(1,steps+1):
    u=k/steps;v=1-u
    if c=='Q':x=v*v*origin[0]+2*v*u*a[0]+u*u*a[2];y=v*v*origin[1]+2*v*u*a[1]+u*u*a[3]
    else:x=v**3*origin[0]+3*v*v*u*a[0]+3*v*u*u*a[2]+u**3*a[4];y=v**3*origin[1]+3*v*v*u*a[1]+3*v*u*u*a[3]+u**3*a[5]
    pts.append((x,y))
   p=end
 return pts

def fill(d):return Polygon(path(d)).buffer(0)
def move(g,x=0,y=0):return affinity.translate(g,xoff=x,yoff=y)
def scale(g,x=1,y=1):return affinity.scale(g,xfact=x,yfact=y,origin=(0,0))
def unite(*p):return unary_union([x for x in p if x is not None and not x.is_empty]).buffer(0)
def stroke(d,w=72,stress=True):
 w*=1.18
 pts=path(d);left=[];right=[]
 # Continuous normals give smooth calligraphic edges; no scalloped circle joins.
 for i,p in enumerate(pts):
  a=pts[max(0,i-1)];b=pts[min(len(pts)-1,i+1)]
  dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy)
  if not length:continue
  r=w/2*(.48+.52*abs(dy)/length) if stress else w/2
  nx,ny=-dy/length*r,dx/length*r
  left.append((p[0]+nx,p[1]+ny));right.append((p[0]-nx,p[1]-ny))
 return Polygon(left+list(reversed(right))).buffer(0) if len(left)>1 else Polygon()

def stem(x,y=0,h=520,w=76,flared=True):
 w*=1.15
 # Chisel-cut gothic entry, a subtle tapered vertical and a forward foot.
 return fill(f'M {x-w/2-11} {y+h-6} L {x+w/2-8} {y+h+19} L {x+w/2+4} {y+h-29} L {x+w/2-5} {y+47} Q {x+w/2-5} {y+12} {x+w/2+30} {y+3} L {x+w/2+30} {y-8} L {x-w/2+7} {y-8} L {x-w/2+7} {y+h-39} Z')
def foot(x,y=0):return fill(f'M {x-58} {y+3} Q {x-22} {y+14} {x-16} {y+36} L {x+20} {y+36} Q {x+26} {y+11} {x+65} {y+2} L {x+65} {y-9} L {x-58} {y-9} Z')
def dot(x,y,r=39):return fill(f'M {x} {y+r+8} Q {x+18} {y+12} {x+r} {y} Q {x+16} {y-12} {x} {y-r} Q {x-14} {y-12} {x-r} {y} Q {x-15} {y+14} {x} {y+r+8} Z')
def oval(w=470,h=520):
 outer=fill(f'M {w*.5} {h+8} C {w*.2} {h-4} 24 {h*.73} 28 {h*.47} C 32 {h*.17} {w*.24} -9 {w*.5} -12 C {w*.8} -4 {w-21} {h*.26} {w-28} {h*.54} C {w-32} {h*.79} {w*.76} {h-4} {w*.5} {h+8} Z')
 inner=fill(f'M {w*.47} {h-44} C {w*.67} {h-43} {w-103} {h*.76} {w-104} {h*.48} C {w-102} {h*.23} {w*.69} 40 {w*.53} 42 C {w*.31} 48 103 {h*.25} 104 {h*.53} C 106 {h*.77} {w*.3} {h-40} {w*.47} {h-44} Z')
 return outer.difference(inner)
def arch(x,y=0,w=310,h=520):return stroke(f'M {x} {y+350} Q {x+67} {y+h-47} {x+w*.53} {y+h+7} L {x+w-12} {y+h-64} L {x+w-12} {y+1}',72)
G={};W={}
def put(c,g,w):G[c]=g;W[c]=w
# Lowercase: open counters and a high x-height retain clarity at interface sizes.
put('o',move(oval(),30),530)
put('n',unite(stem(92),arch(92),foot(390)),485)
put('m',unite(stem(92),arch(92,w=275),arch(355,w=275),foot(615)),710)
put('h',unite(stem(92,h=730),arch(92),foot(390)),485)
put('u',unite(stem(90,y=190,h=320),stroke('M90 230 L90 170 Q90 -30 250 20 Q340 36 385 170',76),stem(385)),475)
put('b',unite(stem(92,h=730),move(oval(420,520),67)),545)
put('d',unite(move(oval(420,520),23),stem(415,h=730)),500)
put('p',unite(stem(92,y=-210,h=725),move(oval(420,520),67)),545)
put('q',unite(move(oval(420,520),23),stem(415,y=-210,h=725)),510)
put('a',unite(stroke('M115 426 Q192 530 322 502 Q450 477 430 320 L430 5',74),move(scale(oval(410,360),1,1),27),stem(430,h=345)),520)
put('e',stroke('M455 102 Q372 -20 228 21 Q54 58 70 269 Q88 493 260 516 Q445 518 458 289 L100 270',73),530)
put('c',stroke('M436 433 Q363 541 228 503 Q58 448 70 250 Q75 61 231 19 Q350 -6 437 97',75),510)
put('i',unite(stem(100,h=508),dot(99,660,36)),225)
put('l',unite(stem(95,h=730),stroke('M115 45 Q130 3 174 17',54)),235)
put('j',unite(stem(146,y=-78,h=586),stroke('M146 -53 Q146 -233 20 -199',70),dot(146,660,36)),265)
put('t',unite(stem(190,h=656),stroke('M76 469 L338 482',58),stroke('M202 63 Q228 -8 324 48',65)),385)
put('f',unite(stem(164,y=-10,h=566),stroke('M164 480 L164 555 Q165 772 338 713',76),stroke('M56 476 L320 487',55)),390)
put('r',unite(stem(92),stroke('M104 345 Q173 555 317 503 L341 451',74)),395)
put('s',stroke('M397 433 Q323 537 191 500 Q59 462 99 351 Q120 300 265 250 Q412 195 382 98 Q345 -18 196 14 Q105 24 61 84',79),465)
put('v',unite(stroke('M62 505 L218 5 Q260 41 287 127 L411 508',74),foot(65,y=500)),480)
put('w',unite(stroke('M58 506 L170 8 L300 310 L411 7 Q450 43 479 126 L590 508',72),stroke('M283 504 L411 7',68)),660)
put('x',unite(stroke('M80 505 L430 1',72),stroke('M417 506 L70 0',68)),500)
put('y',unite(stroke('M59 510 L226 92',72),stroke('M427 507 L245 22 Q165 -199 64 -196',75)),490)
put('z',unite(stroke('M64 468 L411 487 L71 21 L431 33',72),fill('M60 471 L92 534 L124 474 Z')),500)
put('k',unite(stem(92,h=730),stroke('M405 510 L122 245 L430 8',74)),505)
put('g',unite(move(oval(420,520),23),stem(420,y=-75,h=584),stroke('M420 -51 Q426 -227 259 -218 Q131 -214 91 -148',74)),515)
# Capitals carry the heraldic silhouette: extended chisel entries and controlled sweeps.
put('A',unite(stroke('M62 0 L292 716 Q311 742 324 713 L554 0',82),stroke('M149 237 L467 252',58),foot(66),foot(549)),625)
put('B',unite(stem(107,h=720,w=86),stroke('M110 699 Q516 783 506 545 Q500 377 132 363 Q558 401 539 184 Q532 -35 112 22',83)),625)
put('C',stroke('M548 606 Q431 765 252 691 Q60 610 66 350 Q71 93 265 21 Q440 -32 551 115',88),640)
put('D',unite(stem(110,h=720,w=88),stroke('M114 699 Q563 773 574 379 Q589 -15 113 22',86)),665)
put('E',unite(stem(110,h=720,w=84),stroke('M112 696 L537 707 L535 637',70),stroke('M113 367 L443 382',62),stroke('M111 20 L549 33 L569 112',70)),625)
put('F',unite(stem(110,h=720,w=84),stroke('M112 698 L544 711 L547 638',70),stroke('M114 370 L448 385',62)),605)
put('G',unite(stroke('M553 600 Q440 762 253 690 Q58 616 66 350 Q72 97 266 25 Q434 -21 555 104 L550 337 L340 328',86)),645)
put('H',unite(stem(110,h=720,w=84),stem(523,h=720,w=84),stroke('M115 353 Q317 382 523 367',64)),640)
put('I',unite(stem(151,h=720,w=84),stroke('M62 701 L246 714',58),stroke('M59 17 L256 28',56)),320)
put('J',unite(stem(360,y=165,h=550,w=84),stroke('M360 196 Q363 -39 190 7 Q90 31 69 126',85),stroke('M238 700 L450 713',60)),510)
put('K',unite(stem(110,h=720,w=84),stroke('M548 715 L158 333 L571 0',83)),650)
put('L',unite(stem(110,h=720,w=84),stroke('M114 21 L502 35 Q543 38 559 116',73)),615)
put('M',unite(stem(110,h=720,w=84),stroke('M110 701 L350 271 L578 708',81),stem(578,h=720,w=84)),690)
put('N',unite(stem(110,h=720,w=80),stroke('M120 706 L531 10',84),stem(531,h=720,w=76)),645)
put('O',move(oval(590,720),25),650)
put('P',unite(stem(110,h=720,w=84),stroke('M114 697 Q528 793 527 548 Q535 330 119 368',85)),620)
put('Q',unite(move(oval(590,720),25),stroke('M365 154 Q470 -49 634 -79',80)),695)
put('R',unite(stem(110,h=720,w=84),stroke('M114 697 Q528 793 527 548 Q535 330 119 368',85),stroke('M305 366 Q398 231 491 64 Q535 -13 592 37',90)),665)
put('S',stroke('M527 609 Q408 773 219 694 Q61 626 120 458 Q155 374 343 296 Q552 213 498 92 Q445 -41 247 11 Q128 34 72 131',91),625)
put('T',unite(stroke('M61 648 L72 706 L574 718 L584 655',70),stem(319,h=700,w=86)),645)
put('U',unite(stem(105,y=240,h=475,w=83),stem(520,y=240,h=475,w=83),stroke('M105 265 Q103 23 307 15 Q521 14 520 266',84)),635)
put('V',unite(stroke('M68 714 L301 6 Q325 42 356 127 L559 716',86),foot(68,700)),635)
put('W',unite(stroke('M61 715 L239 6 L416 439 L597 6 Q633 64 650 131 L811 716',84),stroke('M375 715 L597 6',80)),885)
put('X',unite(stroke('M83 715 L558 4',85),stroke('M547 714 L74 0',79)),645)
put('Y',unite(stroke('M65 714 L308 358 L553 716',83),stem(308,h=370,w=84)),625)
put('Z',unite(stroke('M77 666 L90 709 L547 720 L81 19 L557 33 L575 98',83)),650)
# Signature capitals: original split-chisel R and comet-terminal S.
Rstem=fill('M67 2 L97 40 L97 640 L45 687 L143 747 L199 691 L185 385 L181 73 L223 4 L151 28 L98 -8 Z')
Rbowl=fill('M165 708 Q298 803 469 699 Q575 632 532 505 Q490 387 173 367 L169 430 Q355 437 411 514 Q465 588 396 650 Q311 719 172 652 Z')
Rleg=fill('M205 382 Q285 422 321 366 Q397 244 476 100 Q524 17 605 54 L614 29 Q497 -62 436 26 Q344 147 254 291 L177 332 Z')
put('R',unite(Rstem,Rbowl,Rleg),680)
Smain=stroke('M529 614 Q423 783 229 698 Q59 621 131 456 Q170 370 346 296 Q548 207 496 95 Q444 -40 252 11 Q129 37 69 128',105)
Shead=fill('M436 690 L553 743 L531 618 L482 657 Z')
Sfoot=fill('M70 130 L36 8 L158 47 L117 71 Z')
put('S',unite(Smain,Shead,Sfoot),635)
# Numerals: slashed zero, distinct one, open four; tabular advance.
nums={
'0':unite(move(scale(oval(530,700)),48),stroke('M171 105 L465 603',32)),
'1':unite(stroke('M141 568 L308 706 L308 19',86),stroke('M170 19 L451 29',65)),
'2':stroke('M99 565 Q128 753 328 705 Q539 658 469 486 Q438 413 311 321 L107 25 L526 37',86),
'3':stroke('M109 626 Q301 770 453 673 Q599 515 313 374 Q548 340 498 155 Q450 -52 115 59',88),
'4':unite(stroke('M420 3 L420 705 L86 251 L537 265',80)),
'5':stroke('M510 699 L134 686 L119 384 Q260 454 396 388 Q552 323 491 146 Q426 -32 102 63',87),
'6':unite(stroke('M470 667 Q258 806 131 443 Q53 187 159 67',86),move(oval(440,388),89)),
'7':unite(stroke('M88 656 L98 706 L536 717 L235 10',84),stroke('M213 307 L463 321',55)),
'8':unite(move(oval(434,350),90,363),move(oval(477,380),68)),
'9':unite(move(oval(440,388),76,323),stroke('M470 643 Q558 379 421 147 Q321 -22 126 39',86))}
for c,g in nums.items():put(c,g,625)
put(' ',Polygon(),280)
# Functional punctuation, with the same cut nib and orbital curves.
for c,g,w in [('.',dot(96,42,36),190),(',',unite(dot(99,45,35),stroke('M115 28 Q113 -61 54 -103',37,False)),195),(':',unite(dot(96,65,33),dot(96,385,33)),200),(';',unite(dot(96,385,33),dot(96,65,33),stroke('M112 45 Q113 -44 57 -81',36,False)),200),('!',unite(fill('M69 719 L153 728 L134 182 L93 169 Z'),dot(111,42,37)),225),('?',unite(stroke('M78 582 Q96 750 274 708 Q442 660 352 493 Q315 431 230 364 L218 184',79),dot(218,42,37)),465),('-',stroke('M60 278 L305 287',52),365),('_',stroke('M34 -115 L489 -115',55),525),('=',unite(stroke('M58 375 L475 375',49,False),stroke('M58 179 L475 179',49,False)),535),('+',unite(stroke('M68 275 L479 275',49,False),stroke('M275 70 L275 482',60,False)),550),('/',stroke('M50 -60 L353 758',55,False),415),('\\',stroke('M50 758 L353 -60',55,False),415),('|',stroke('M100 -200 L100 760',50,False),200)]:put(c,g,w)
put("'",fill('M64 730 L139 748 L113 561 L78 554 Z'),200)
put('"',unite(G["'"],move(G["'"],140)),340)
put('(',stroke('M246 762 Q43 589 63 262 Q76 -5 245 -164',60),315)
put(')',move(affinity.scale(G['('],xfact=-1,yfact=1,origin=(0,0)),315),315)
put('[',stroke('M260 751 L95 751 L95 -154 L260 -154',52,False),330)
put(']',move(affinity.scale(G['['],xfact=-1,yfact=1,origin=(0,0)),330),330)
put('{',stroke('M300 754 Q126 765 142 517 Q156 337 62 299 Q152 269 142 99 Q122 -156 300 -150',55),365)
put('}',move(affinity.scale(G['{'],xfact=-1,yfact=1,origin=(0,0)),365),365)
put('<',stroke('M416 507 L85 277 L416 50',55,False),510)
put('>',move(affinity.scale(G['<'],xfact=-1,yfact=1,origin=(0,0)),510),510)
put('*',unite(stroke('M70 615 L330 477',42,False),stroke('M70 477 L330 615',42,False),stroke('M200 700 L200 392',42,False)),400)
put('#',unite(stroke('M177 750 L118 -55',56,False),stroke('M399 750 L340 -55',56,False),stroke('M49 462 L501 462',48,False),stroke('M35 229 L484 229',48,False)),555)
put('%',unite(move(scale(oval(240,280)),30,427),move(oval(240,280),340),stroke('M113 0 L515 719',48,False)),625)
put('&',unite(stroke('M494 564 Q478 747 306 713 Q135 677 221 478 L525 48 Q565 -1 596 49',77),stroke('M214 442 Q-22 290 109 77 Q215 -71 416 95 Q515 191 543 351',76)),665)
put('@',unite(move(oval(700,720),20),move(scale(G['a'],.68,.72),174,151),stroke('M500 530 L510 201 Q624 159 645 329',43)),780)
put('$',unite(move(scale(G['S'],.85,.9),18,20),stroke('M297 -107 L297 826',39,False)),590)
put('€',unite(move(scale(G['C'],.9,.96),0,0),stroke('M29 416 L417 416',43,False),stroke('M29 273 L377 273',43,False)),615)
put('£',unite(stroke('M496 629 Q422 764 259 685 Q151 630 194 393 L198 210 Q196 55 80 22 L519 32',77),stroke('M61 338 L420 351',51)),600)
put('^',stroke('M64 479 L256 716 L452 480',53,False),520)
put('~',stroke('M62 300 Q168 417 282 303 Q387 199 484 312',44,False),550)
put('`',stroke('M72 757 L210 615',65,False),285)
# Aliases and essential application symbols.
for c,base in [('–','-'),('—','-'),('−','-')]:put(c,scale(G[base],1.7 if c=='–' else 2.4 if c=='—' else 1.5,1),int(W[base]*(1.7 if c=='–' else 2.4 if c=='—' else 1.5)))
put('…',unite(G['.'],move(G['.'],190),move(G['.'],380)),570)
for c,base in [('’',"'"),('‘',"'"),('“','"'),('”','"')]:put(c,G[base],W[base])
put('→',unite(stroke('M52 282 L688 282',47,False),stroke('M490 475 L694 282 L490 90',50,False)),770)
put('←',move(affinity.scale(G['→'],xfact=-1,yfact=1,origin=(0,0)),770),770)
put('↗',unite(stroke('M100 80 L596 576',48,False),stroke('M316 575 L598 578 L596 296',50,False)),700)
put('✓',stroke('M65 301 L231 96 L565 588',72,False),650)
put('·',dot(100,280,27),200)
put('×',unite(stroke('M87 480 L451 80',49,False),stroke('M451 480 L87 80',49,False)),545)
put('÷',unite(stroke('M65 280 L465 280',49,False),dot(263,458,31),dot(263,101,31)),530)
put('©',unite(move(oval(720,720),25),move(scale(G['C'],.52,.57),193,149)),790)
put('®',unite(move(oval(720,720),25),move(scale(G['R'],.51,.57),200,148)),790)
# Extended Latin handcrafted variants; accents are original components.
put('æ',unite(scale(G['a'],.85,1),move(scale(G['e'],.85,1),370)),840)
put('Æ',unite(scale(G['A'],.9,1),move(scale(G['E'],.9,1),465)),1030)
put('œ',unite(scale(G['o'],.9,1),move(scale(G['e'],.9,1),405)),900)
put('Œ',unite(scale(G['O'],.9,1),move(scale(G['E'],.9,1),489)),1050)
for c,base in [('ø','o'),('Ø','O')]:put(c,unite(G[base],stroke(f'M75 -35 L{W[base]-65} {735 if c.isupper() else 555}',40,False)),W[base])
put('ß',unite(stem(93,h=556),stroke('M93 495 Q92 757 286 707 Q472 645 290 438 Q532 309 439 104 Q375 -34 214 34',76)),550)
for c,base in [('ł','l'),('Ł','L')]:put(c,unite(G[base],stroke(f'M27 315 L{W[base]-25} 480',40,False)),W[base])
put('ı',stem(100,h=508),225)
put('ð',unite(G['o'],stroke('M155 729 Q493 702 455 385',65),stroke('M126 598 L399 730',43,False)),540)
put('Ð',unite(G['D'],stroke('M40 351 L320 360',50,False)),W['D'])
put('þ',unite(stem(92,y=-210,h=940),move(oval(420,480),67)),545)
put('Þ',unite(stem(110,h=720,w=84),stroke('M114 543 Q517 624 514 405 Q516 185 119 224',84)),620)
put('ſ',G['f'],W['f'])
# accent geometry centered on each base; uppercase accents clear the cap height.
def accent(mark,x,y):
 if mark=='\u0300':return stroke(f'M{x-65} {y+106} L{x+48} {y+24}',56,False)
 if mark=='\u0301':return stroke(f'M{x-45} {y+24} L{x+76} {y+112}',56,False)
 if mark=='\u0302':return stroke(f'M{x-94} {y+18} L{x} {y+113} L{x+94} {y+18}',44,False)
 if mark=='\u0303':return stroke(f'M{x-110} {y+47} Q{x-55} {y+129} {x} {y+63} Q{x+55} {y-2} {x+112} {y+81}',34,False)
 if mark=='\u0308':return unite(dot(x-78,y+60,29),dot(x+78,y+60,29))
 if mark=='\u030a':return Point(x,y+72).buffer(65,quad_segs=18).difference(Point(x,y+72).buffer(32,quad_segs=18))
 if mark=='\u0304':return stroke(f'M{x-108} {y+65} L{x+108} {y+65}',38,False)
 if mark=='\u0306':return stroke(f'M{x-102} {y+103} Q{x} {y-18} {x+103} {y+103}',42,False)
 if mark=='\u0307':return dot(x,y+61,31)
 if mark=='\u030b':return unite(stroke(f'M{x-95} {y+20} L{x-13} {y+108}',38,False),stroke(f'M{x+26} {y+20} L{x+108} {y+108}',38,False))
 if mark=='\u030c':return stroke(f'M{x-95} {y+108} L{x} {y+20} L{x+94} {y+108}',43,False)
 if mark=='\u0327':return stroke(f'M{x+10} -12 L{x-25} -58 Q{x+72} -51 {x+52} -119 Q{x+25} -167 {x-52} -137',39,False)
 if mark=='\u0328':return stroke(f'M{x+50} 2 Q{x-26} -54 {x+1} -114 Q{x+36} -151 {x+91} -108',40,False)
 return None
for cp in range(0xA0,0x180):
 c=chr(cp)
 if c in G:continue
 decom=unicodedata.normalize('NFD',c)
 if len(decom)==2 and decom[0] in G:
  b,m=decom;x=W[b]/2;y=770 if b.isupper() else 552
  a=accent(m,x,y)
  if a is not None:
   base=G[b]
   if b in 'ij' and m not in ['\u0327','\u0328']:base=base.difference(box(-100,565,600,755))
   put(c,unite(base,a),W[b])
# Remaining Latin-1 punctuation / spacing.
put('\u00a0',G[' '],280)
for c,base in [('¡','!'),('¿','?')]:put(c,move(affinity.rotate(G[base],180,origin=(W[base]/2,360)),0,-70),W[base])
put('«',unite(scale(G['<'],.58,.75),move(scale(G['<'],.58,.75),225)),565)
put('»',move(affinity.scale(G['«'],xfact=-1,yfact=1,origin=(0,0)),565),565)
put('°',move(oval(230,230),45,485),335)
put('¬',stroke('M70 380 L460 380 L460 160',48,False),535)
put('¦',unite(stroke('M100 760 L100 345',50,False),stroke('M100 215 L100 -200',50,False)),200)
put('±',unite(G['+'],stroke('M68 -30 L479 -30',49,False)),550)
put('§',stroke('M411 664 Q267 789 156 655 Q53 517 302 399 Q535 271 376 147 Q249 50 125 178 Q-7 325 228 441 Q492 563 400 702 M149 69 Q269 -45 401 75',68),535)
put('¶',unite(move(scale(oval(430,400)),10,307),stem(360,y=-100,h=810,w=63),stem(507,y=-100,h=810,w=63)),600)
for c,base in [('ª','a'),('º','o'),('²','2'),('³','3'),('¹','1')]:put(c,move(scale(G[base],.57,.57),0,390),round(W[base]*.57+30))
put('µ',unite(stem(92,y=-210,h=720),stroke('M100 370 L100 190 Q98 -22 260 20 Q349 51 385 170',73),stem(385)),490)
put('´',accent('\u0301',130,500),290)
put('¨',accent('\u0308',150,500),320)
put('¸',accent('\u0327',120,0),290)
put('¤',unite(move(oval(410,410),50,100),stroke('M62 539 L466 76',45,False),stroke('M62 76 L466 539',45,False)),555)
put('¢',unite(scale(G['c'],1,1.1),stroke('M271 -107 L271 686',35,False)),530)
for c,d in [('¼','14'),('½','12'),('¾','34')]:put(c,unite(move(scale(G[d[0]],.46,.46),0,383),move(scale(G[d[1]],.46,.46),360),stroke('M133 -9 L571 723',42,False)),680)
put('\u00ad',G['-'],W['-'])
# Minimal UI symbols drawn in the same family.
put('◉',Point(270,290).buffer(214,quad_segs=32).difference(Point(270,290).buffer(174,quad_segs=32)).union(Point(270,290).buffer(110,quad_segs=24)),540)
put('◷',unite(Point(270,290).buffer(214,quad_segs=32).difference(Point(270,290).buffer(176,quad_segs=32)),stroke('M270 470 L270 290 L419 290',33,False)),540)
put('◇',fill('M270 550 L496 290 L270 30 L44 290 Z').difference(fill('M270 488 L444 290 L270 92 L96 290 Z')),540)
put('☰',unite(*[stroke(f'M70 {y} L470 {y}',42,False) for y in [105,290,475]]),540)
# Build outlines into one TrueType face. Union removes overlap and preserves counters.
names={c:('space' if c==' ' else f'uni{ord(c):04X}') for c in G};order=['.notdef']+list(names.values());glyphs={};metrics={}
def penGlyph(shape):
 pen=TTGlyphPen(None)
 if not shape.is_empty:
  parts=[shape] if shape.geom_type=='Polygon' else list(shape.geoms)
  for poly in parts:
   if poly.geom_type!='Polygon':continue
   poly=orient(poly.simplify(.65,preserve_topology=True),sign=-1)
   for ring in [poly.exterior,*poly.interiors]:
    pts=[(round(x),round(y)) for x,y in list(ring.coords)[:-1]]
    pts=[p for i,p in enumerate(pts) if i==0 or p!=pts[i-1]]
    if len(pts)<3:continue
    pen.moveTo(pts[0])
    for p in pts[1:]:pen.lineTo(p)
    pen.closePath()
 return pen.glyph()
glyphs['.notdef']=penGlyph(box(60,0,470,700).difference(box(110,50,420,650)));metrics['.notdef']=(530,60)
for c,g in G.items():
 n=names[c];glyphs[n]=penGlyph(g);xmin=round(g.bounds[0]) if not g.is_empty else 0;metrics[n]=(W[c],xmin)
fb=FontBuilder(UPM,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap({ord(c):names[c] for c in G});fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=1000,descent=-300,lineGap=50)
fb.setupNameTable({'familyName':'Random Stranger','styleName':'Regular','uniqueFontIdentifier':'RandomStranger-Regular-1.000-20261107','fullName':'Random Stranger Regular','psName':'RandomStranger-Regular','version':'Version 1.000','copyright':'Original custom outlines created for Random Stranger, 2026.','designer':'Random Stranger project','description':'A custom contemporary Gothic typeface: chisel terminals, orbital curves, high x-height. Original outlines; no third-party font source.','licenseDescription':'Custom project font. See FONT_README.md.'})
fb.setupOS2(sTypoAscender=1000,sTypoDescender=-300,sTypoLineGap=50,usWinAscent=1000,usWinDescent=300,sxHeight=520,sCapHeight=720,usWeightClass=400,usWidthClass=5,fsType=0,fsSelection=0x40)
fb.setupPost(keepGlyphNames=True);fb.setupMaxp();font=fb.font
pairs=[('A','V',-58),('A','W',-46),('A','Y',-60),('T','a',-48),('T','o',-48),('T','e',-43),('V','a',-41),('V','o',-39),('W','a',-29),('Y','o',-56),('Y','a',-50),('F','o',-27),('P','a',-27),('L','T',-28),('r','o',-10),('R','a',-11)]
features='languagesystem DFLT dflt;\nfeature kern {\n'+''.join(f'pos {names[a]} {names[b]} {v};\n' for a,b,v in pairs)+'} kern;'
addOpenTypeFeaturesFromString(font,features)
font.save(OUT/'RandomStranger-Regular.ttf');font.flavor='woff2';font.save(OUT/'RandomStranger-Regular.woff2')
print(f'Built Random Stranger: {len(G)} mapped glyphs; {len(pairs)} kerning pairs. TTF + WOFF2.')
