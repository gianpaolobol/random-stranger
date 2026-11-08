from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];FONT=R/'assets/fonts/fluid-v3/RandomStranger-Regular.ttf'
im=Image.new('RGB',(1500,1300),'#06091e');d=ImageDraw.Draw(im)
def t(text,x,y,size,color='#a8e9ff'):
 f=ImageFont.truetype(str(FONT),size)
 while d.textlength(text,font=f)>1340:size-=1;f=ImageFont.truetype(str(FONT),size)
 d.text((x,y),text,font=f,fill=color)
t('RANDOM STRANGER / DISEGNO FLUIDO',80,50,25,'#98a7c6')
t('Random Stranger',80,115,155)
t('Incontra una persona.',80,340,87)
t('Non un’immagine.',80,465,87,'#ff2198')
d.line((80,630,1420,630),fill='#29304a',width=2)
t('abcdefghijklm',80,660,74)
t('nopqrstuvwxyz',80,765,74)
t('R S A M O   /   0123456789',80,885,53,'#ff2198')
t('Raccontati con parole tue. Un incontro comincia',80,1015,35,'#c2cde0')
t('da una descrizione sincera e dal rispetto reciproco.',80,1068,35,'#c2cde0')
t('à è é ì ò ù  ·  Cancellazione entro un’ora',80,1173,30,'#98a7c6')
im.save(R/'docs/typography/RandomStranger-fluid-v3.png')
