from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1];FONT=ROOT/'assets/fonts/RandomStranger-Regular.ttf'
img=Image.new('RGB',(1600,1830),'#06091e');d=ImageDraw.Draw(img)
def line(txt,y,size=50,color='#a8e9ff',x=100):
 f=ImageFont.truetype(str(FONT),size)
 while d.textlength(txt,font=f)>1400:size-=1;f=ImageFont.truetype(str(FONT),size)
 d.text((x,y),txt,font=f,fill=color);return f
line('RANDOM STRANGER / CARATTERE ORIGINALE',70,23,'#97a6c7')
line('Random Stranger',133,154)
line('Un altro tempo.',345,88,'#ff2198')
line('Un nuovo incontro.',452,88)
d.line((100,615,1500,615),fill='#29304a',width=2)
line('MAIUSCOLE',650,22,'#97a6c7')
line('ABCDEFGHIJKLM',704,65)
line('NOPQRSTUVWXYZ',798,65)
line('MINUSCOLE',920,22,'#97a6c7')
line('abcdefghijklm',968,70)
line('nopqrstuvwxyz',1060,70)
d.line((100,1198,1500,1198),fill='#29304a',width=2)
line('0123456789   À È É Ì Ò Ù',1234,58,'#ff2198')
line('Le persone prima delle aspettative.',1360,38)
line('Raccontati con parole tue. Un incontro comincia',1430,30,'#c2cde0')
line('da una descrizione sincera e dal rispetto reciproco.',1476,30,'#c2cde0')
line('Cancellazione entro un’ora · 18+ · 15 km',1555,26,'#c2cde0')
d.line((100,1655,1500,1655),fill='#29304a',width=2)
line('GOTICO / ORBITALE / CONTEMPORANEO',1700,24,'#97a6c7')
img.save(ROOT/'docs/typography/RandomStranger-specimen.png')
print('Specimen rendered from the real TTF.')
