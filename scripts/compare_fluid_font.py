from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];new=R/'assets/fonts/fluid-v3/RandomStranger-Regular.ttf';old=R/'assets/fonts/archive/RandomStranger-v2.ttf'
im=Image.new('RGB',(1500,1170),'#06091e');d=ImageDraw.Draw(im)
def t(text,x,y,size=35,color='#a8e9ff',font=new):
 f=ImageFont.truetype(str(font),size)
 while d.textlength(text,font=f)>1340:size-=1;f=ImageFont.truetype(str(font),size)
 d.text((x,y),text,font=f,fill=color)
t('VERSIONE PRECEDENTE',80,46,23,'#98a7c6')
t('Random Stranger',80,90,135,'#98a7c6',old)
d.line((80,280,1420,280),fill='#29304a',width=2)
t('NUOVO DISEGNO / CURVE E RACCORDI',80,318,23,'#ff2198')
t('Random Stranger',80,360,135)
t('n  m  o  a  g',80,562,132,'#ff2198')
t('Incontra una persona.',80,758,75)
t('Non un’immagine.',80,862,75,'#ff2198')
t('Raccontati con parole tue. Un incontro comincia',80,1010,31,'#c2cde0')
t('da una descrizione sincera e dal rispetto reciproco.',80,1057,31,'#c2cde0')
im.save(R/'docs/typography/RandomStranger-fluid-v3-comparison.png')
