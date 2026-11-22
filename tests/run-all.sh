#!/usr/bin/env bash
# Julkaisun tarkistus: ajaa kaikki savutestit ja satunnaistestin usealla siemenluvulla.
# Palauttaa 0 vain, jos kaikki läpäisevät. Asetukset: JOBS (rinnakkaisuus), FUZZ_SEEDS (oletus "1 2 3 4 5 6"), FUZZ_N (oletus 200).
cd "$(dirname "$0")/.." || exit 2
rm -rf .res && mkdir .res
JOBS="${JOBS:-6}"; FUZZ_SEEDS="${FUZZ_SEEDS:-1 2 3 4 5 6}"; FUZZ_N="${FUZZ_N:-200}"
ls tests/smoke*.js | xargs -P"$JOBS" -I{} sh -c 'timeout 110 node {} > .res/$(basename {}).out 2>&1; echo $? > .res/$(basename {}).rc'
for sd in $FUZZ_SEEDS; do echo "$sd"; done | xargs -P"$JOBS" -I{} sh -c "SEED={} N=$FUZZ_N timeout 230 node tests/fuzz.js > .res/fuzz{}.out 2>&1; echo \$? > .res/fuzz{}.rc"
bad=$(grep -L '^0$' .res/*.rc)
if [ -n "$bad" ]; then echo "EPÄONNISTUI:"; for f in $bad; do n=$(basename "$f" .rc); echo "--- $n"; head -8 ".res/$n.out"; done; exit 1; fi
echo "KAIKKI LÄPI: $(ls .res/*.rc | wc -l) ajoa"
