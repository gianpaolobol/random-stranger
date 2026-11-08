from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]
new=root/'assets/fonts/RandomStranger-Regular.ttf';old=root/'assets/fonts/archive/RandomStranger-v1.ttf'
im=Image.new('RGB',(1500,1080),'#06091e');d=ImageDraw.Draw(im)
def txt(text,x,y,size=35,color='#a8e9ff',font=new):d.text((x,y),text,font=ImageFont.truetype(str(font),size),fill=color)
txt('RANDOM STRANGER / REVISIONE 02',80,55,23,'#97a6c7')
txt('Prima',80,112,24,'#97a6c7');txt('Random Stranger',80,145,134,'#97a6c7',old)
d.line((80,321,1420,321),fill='#29304a',width=2)
txt('Nuova versione',80,352,25,'#ff2198');txt('Random Stranger',80,403,134)
txt('Incontra una persona.',80,583,70);txt('Non un’immagine.',80,672,70,'#ff2198')
d.line((80,788,1420,788),fill='#29304a',width=2)
txt('Raccontati con parole tue. Un incontro comincia',80,822,32,'#c2cde0')
txt('da una descrizione sincera e dal rispetto reciproco.',80,870,32,'#c2cde0')
txt('à è é ì ò ù   /   0123456789   /   18+',80,958,31)
im.save(root/'docs/typography/RandomStranger-v2-comparison.png')
