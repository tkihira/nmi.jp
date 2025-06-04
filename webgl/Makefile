
#OPTIMIZE=--optimize lto,no-assert,no-log,fold-const,return-if,inline,unbox,fold-const,lcse,fold-const,array-length,unclassify

all:
	jsx --release --executable web --output main.jsx.js main.jsx

debug:
	jsx --executable web --output main.jsx.js main.jsx

debug-with-source-map:
	jsx --enable-source-map --executable web --output main.jsx.js main.jsx

update-mvq:
	curl -LO https://raw.github.com/thaga/mvq.jsx/master/lib/mvq.jsx
	chmod -w mvq.jsx # make read only
