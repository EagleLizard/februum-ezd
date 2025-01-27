
run-lua:
	lua init.lua
watch-lua:
	fswatch -ro ./src | xargs -n1 -I{} make run-lua
