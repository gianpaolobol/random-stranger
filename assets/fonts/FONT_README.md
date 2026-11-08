# Random Stranger — versione 2.000 (archivio)

Un unico carattere per titoli e testo: **Random Stranger Regular**.
- `RandomStranger-Regular.ttf`: installabile su desktop e incorporabile nelle app native.
- `RandomStranger-Regular.woff2`: stessa famiglia e stessi glifi, compressi per il web.
- 320 caratteri mappati: alfabeto latino, estensioni europee, accenti italiani, numeri e simboli UI.
- 16 coppie di crenatura OpenType; disegni distinti per I/l/1 e O/0.
- Maiuscole di 720 unità, altezza x di 520, em di 1000.

## Disegno
R con asta a scalpello e gamba curva; S con terminali araldici; n/m/h con archi appuntiti. Contrasto tra verticali e tratti orizzontali, occhielli aperti, zero barrato, punte a rombo su i/j e punteggiatura. Una sintesi tra scrittura gotica, segno araldico e curve geometriche contemporanee.
Gli outline sono costruiti per questo progetto in `scripts/build_font.py`, senza leggere, trasformare o rinominare file di altri font. Il marchio raster approvato resta un elemento grafico distinto, non viene sostituito automaticamente.

## Ricostruzione
```sh
python -m pip install -r scripts/font-requirements.txt
python scripts/build_font.py
python scripts/test_font.py
python scripts/render_font_specimen.py
```
Il campionario in `docs/typography/RandomStranger-specimen.png` è composto dal TTF effettivo.

## Applicazione
L’app carica il TTF locale con expo-font e usa la stessa famiglia nei componenti di testo e nei campi di input. Il peso del file è unico; non si dipende da stili bold o italic inesistenti.
Versione iniziale utilizzabile e modificabile dal progetto Random Stranger; i sorgenti degli outline sono inclusi. 

## Revisione 2
Richiesta: maggiore vicinanza al lettering del logo senza replicarne i lunghi svolazzi. Aumentati peso e cuspidi, a a un piano, e diagonale, occhielli ogivali più pieni. Stessa famiglia unica per titoli e testo; versione1 conservata in archive e nel sorgente versionato.

La versione attualmente approvata e usata nell’app è Random Stranger Fluid v3, nella sottocartella fluid-v3. Questi file v2 sono conservati per confronto.
