
build: index.js components
	@component build

components: component.json
	@component install

clean:
	rm -fr build components

test: build
	@open test/index.html

.PHONY: clean test
