# Lash

Lash is a modern scripting language that compiles to pure bash with the goal of simplifying bash scripting.

## Project description

It offers:
* TypeScript like syntax
* Static type checking
* Full support of all bash features (e.g. pipe) in Version 1.0 ;)
* Pain free scripting without adding extra dependencies to your target machine/container (assuming bash is pre-installed by default)

## Current Status

(!) DO NOT YET USE LASH IN PRODUCTION (!)

Currently Lash has not reached version 1.0. Therefore, it does not support the full bash language, might include bugs and the language may change without further notice.

We are searching for contributors to help us reach version 1.0 ;)

# Installation

For the latest version, run:

## npm

```bash
npm install -g lash-compiler
```

## yarn

```bash
yarn add global lash-compiler
```

# Usage
To compile an input file use:
```bash
lash myscript.lsh
```
This will generate `myscript.sh` in the same folder the input file is located.

## Command line options
You can also specify an output file explicitly:
```bash
lash myscript.lsh --out output.sh
```

To print the output to the console instead of a file use:
```bash
lash input.lsh --print
```

# Syntax
The syntax will be familiar to everyone using TypeScript or Javascript.
```javascript
var s = 1 + 2
s = 3
const h = "Hello"
var greet = h + " World"
const f = 5.63
var c = (f + 3) < 10

function myFun(msg) {
	echo(msg)
}

if (s < 6-2 && c) {
	echo(greet)
}

for (var i = 1; i < 8; i++) {
	myFun(i)
}
```

This will generate the following output:
```bash
s=$(( 1 + 2 ))
s=3
declare -r h="Hello"
greet="${h} World"
declare -r f=5.63
c=$([ $(echo "$f + 3 < 10" | bc -l) -eq 1 ]; echo $?)
function myFun {
	msg=$1
	echo $msg
}
if [ $s -lt $(( 6 - 2 )) ] && [ $c -eq 0 ]; then
	echo $greet
fi
for (( i=1; $i < 8; i++ )); do
	myFun $i
done
```

Please be aware that lash is still in development and does not support all desired features yet. For example you cannot yet define an `else` branch for `if` statements, use comments or make use of the pipe operator.

# Contribute

There are many ways you can contribute to lash:
- report bugs
- get involved into the language design discussions
- clone the repo and start coding

For a detailed description on how to get invloved take a look at [CONTRIBUTING.md](./CONTRIBUTE.md)

# Versioning

We use [Semantic Versioning](http://semver.org/). For the versions available, see the [tags on this repository](https://github.com/crainsaw/lash/tags).

# Authors

* **Christian Nywelt** - *Initial work and maintainer* - [crainsaw](https://github.com/crainsaw)

See also the list of [contributors](https://github.com/crainsaw/lash/graphs/contributors) who participated in this project.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
