
run-lua:
	lua init.lua
watch-lua:
	fswatch -ro ./src | xargs -n1 -I{} make run-lua
run-js:
	node dist/main.js
watch-js:
	fswatch -ro ./dist ./src ./data | xargs -n1 -I{} make run-js