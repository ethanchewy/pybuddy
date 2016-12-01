//Created by Ethan Chiu 2016
function PythonBuddyXBlock(runtime, element) {
$(document).ready(function(){
	//Pulls info from AJAX call and sends it off to codemirror's update linting
	//Has callback result_cb
	var check_code = runtime.handlerUrl(element, 'check_code');
	var run_code = runtime.handlerUrl(element, 'run_code');
	function check_syntax(code, result_cb)
	{	
		//Example error for guideline
		var error_list = [{
            line_no: null,
            column_no_start: null,
            column_no_stop: null,
            fragment: null,
            message: null,
            severity: null
        }];
        
		//Push and replace errors
		function check(errors){
			//Split errors individually by line => list
			//var tokens = errors.split(/\r?\n/);
			var number,message, severity, severity_color, id;
			//Regex for fetching number
			
			//Clear array.
		    error_list = [{
	            line_no: null,
	            column_no_start: null,
	            column_no_stop: null,
	            fragment: null,
	            message: null,
	            severity: null
	        }];
			//console.log(errors);
			document.getElementById('errorslist').innerHTML = '';
		   	$('#errorslist').append("<tr>"+"<th>Line</th>"+"<th>Severity</th>"+
		   		"<th>Error</th>"+ "<th>More Info</th>"+"</tr>");

			for(var x = 2; x < errors.length; x+=2){

				//Sorting into line_no, etc.
				//var match_number = errors[x].match(/\d+/);
				//number = parseInt(match_number[0], 10);
				//severity = errors[x].charAt(0);
				//Split code based on colon
				var message_split = errors[x].split(':');
				//console.log(message_split);

				number = message_split[1];

				//Get severity after second colon
				severity = message_split[2].charAt(2);

				//Get message id by splitting
				id = message_split[2].substring(2,7);

				//Split to get message
				message_split = message_split[2].split("]");
				message = message_split[1];

				//Set severity to necessary parameters
				if(severity=="E"){
					console.log("error");
					severity="error";
					severity_color="red";
				} else if(severity=="W"){
					console.log("error");
					severity="warning";
					severity_color="yellow";
				}
				//Push to error list		
				error_list.push({
					line_no: number, 
					column_no_start: null,
            		column_no_stop: null,
					fragment: null,
					message: message, 
					severity: severity
				});

				//Get help message for each id
				var moreinfo = getHelp(id);
				//Append all data to table
			   	$('#errorslist').append("<tr>"+"<td>" + number + "</td>"
			   		+"<td style=\"background-color:"+severity_color+";\"" + 
			   		">" + severity + "</td>"
			   		+"<td>" + message + "</td>"
			   		+"<td>" + moreinfo + "</td>"+"</tr>");
				

			}
			
			console.log("error_list"+error_list.toString());
	    	result_cb(error_list);

		}
		//AJAX call to pylint
		/*
		$.getJSON(check_code, {
	      text :  code
	    }, function(data) {
	    	console.log(data);
	    	current_text = data;
	    	//Check Text
	    	check(current_text);
	    	return false;
	    });
	    */
	    $.ajax({
	    	type: "POST",
            url: check_code,
            data: JSON.stringify({text :  code}),
            success: function(data) {
		    	console.log(data);
		    	console.log("went through 1");
		    	current_text = data;
		    	check(current_text);
		    	return false;
		    }
	    });
	}

	var editor = CodeMirror.fromTextArea(document.getElementById("txt"), {
        mode: {name: "python",
               version: 2,
               singleLineStringErrors: false},
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        lint:true,
        styleActiveLine:true,
        gutters: ["CodeMirror-lint-markers"],
        lintWith: {
	        "getAnnotations": CodeMirror.remoteValidator,
	        "async" : true,
	        "check_cb":check_syntax
	    },
    });

    //Actually Run in Python 
	$( "#run",element ).click(function(eventObject) {
        $.ajax({
            type: "POST",
            url: run_code,
            data: JSON.stringify({text :  editor.getValue()}),
            success: function(data) {
		    	print_result(data);
		    	console.log("went through 2");
		    	return false;
		    }
    	});
		console.log("sfd");
	    
	    function print_result(data){
	    	document.getElementById('output').innerHTML = '';
	    	$("#output").append("<pre>"+data+"</pre>");
	    }
	}); 

	//Example Code, based on Skulpt website
	var exampleCode = function (id, text) {
        $(id).click(function (e) {
        	console.log("sdf");
            editor.setValue(text);
            editor.focus(); // so that F5 works, hmm
        });
    };

    exampleCode('#codeexample1', "methods = []\nfor i in range(10):\n    methodds.append(lambda x: x + i)\nprint methods[0](10)");
    exampleCode('#codeexample2', "for i in range(5):\n    print i\n");
    exampleCode('#codeexample3', "print [x*x for x in range(20) if x % 2 == 0]");
    exampleCode('#codeexample4', "print 45**123");
    exampleCode('#codeexample5', "print \"%s:%r:%d:%x\\n%#-+37.34o\" % (\n        \"dog\",\n        \"cat\",\n        23456,\n        999999999999L,\n        0123456702345670123456701234567L)");
    exampleCode('#codeexample6', "def genr(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 1\n\nprint list(genr(12))\n");
    exampleCode('#codeexample7', "# obscure C3 MRO example from Python docs\nclass O(object): pass\nclass A(O): pass\nclass B(O): pass\nclass C(O): pass\nclass D(O): pass\nclass E(O): pass\nclass K1(A,B,C): pass\nclass K2(D,B,E): pass\nclass K3(D,A): pass\nclass Z(K1,K2,K3): pass\nprint Z.__mro__\n");
    exampleCode('#codeexample8', "import document\n\npre = document.getElementById('edoutput')\npre.innerHTML = '''\n<h1> Skulpt can also access DOM! </h1>\n''' \n");

	

});
function getHelp(id){
	//From https://docs.pylint.org/en/1.6.0/features.html
	var list = [
		//Imports Checker Messages
		["E0401","Used when pylint has been unable to import a module."],
		["W0406","Used when a module is importing itself."],
		["W0404","Used when a module is reimported multiple times."],
		["W0403","Used when an import relative to the package directory is detected."],
		["W0402","Used a module marked as deprecated is imported."],
		["W0401","Used when from module import * is detected."],
		["W0410","Python 2.5 and greater require __future__ import to be the first non docstring statement in the module."],
		["R0401","Used when a cyclic import between two or more modules is detected."],
		["C0411","Used when PEP8 import order is not respected (standard imports first, then third-party libraries, then local imports)"],
		["C0413","Used when code and imports are mixed."],
		["C0412","Used when imports are not grouped by packages."],
		["C0410","Used when import statement importing multiple modules is detected."],
		//Variables Checker Messages
		["E0633","Used when something which is not a sequence is used in an unpack assignment."],
		["E0604","Used when an invalid (non-string) object occurs in __all__."],
		["E0611","Used when a name cannot be found in a module."],
		["E0632","Used when there is an unbalanced tuple unpacking in assignment."],
		["E0602","Used when an undefined variable is accessed."],
		["E0603","Used when an undefined variable name is referenced in __all__."],
		["E0601","Used when a local variable is accessed before it’s assignment."],
		["W0640","A variable used in a closure is defined in a loop. This will result in all closures using the same value for the closed-over variable."],
		["W0601","Used when a variable is defined through the “global” statement but the variable is not defined in the module scope."],
		["W0622","Used when a variable or function override a built-in."],
		["W0623","Used when an exception handler assigns the exception to an existing name"],
		["W0621","Used when a variable’s name hide a name defined in the outer scope."],
		["W0611","Used when an imported module or variable is not used."],
		["W0613","Used when a function or method argument is not used."],
		["W0614","Used when an imported module or variable is not used from a ‘from X import *’ style import."],
		["W0612","Used when a variable is defined but not used."],
		["W0602","Used when a variable is defined through the “global” statement but no assignment to this variable is done."],
		["W0631","Used when an loop variable (i.e. defined by a for loop or a list comprehension or a generator expression) is used outside the loop."],
		["W0603","Used when you use the “global” statement to update a global variable. Pylint just try to discourage this usage. That doesn’t mean you can not use it !"],
		["W0604","Used when you use the “global” statement at the module level since it has no effect."],
		//Design Checker
		["R0903","Used when class has too few public methods, so be sure it’s really worth it."],
		["R0901","Used when class has too many parent classes, try to reduce this to get a simpler (and so easier to use) class."],
		["R0913","Used when a function or method takes too many arguments."],
		["R0916","Used when a if statement contains too many boolean expressions."],
		["R0912","Used when a function or method has too many branches, making it hard to follow."],
		["R0902","Used when class has too many instance attributes, try to reduce this to get a simpler (and so easier to use) class."],
		["R0914","Used when a function or method has too many local variables."],
		["R0904","Used when class has too many public methods, try to reduce this to get a simpler (and so easier to use) class."],
		["R0911","Used when a function or method has too many return statement, making it hard to follow."],
		["R0915","Used when a function or method has too many statements. You should then split it in smaller functions / methods."],
		//stdlib checker
		["W1501","Python supports: r, w, a[, x] modes with b, +, and U (only with r) options. See http://docs.python.org/2/library/functions.html#open"],
		["W1503","The first argument of assertTrue and assertFalse is a condition. If a constant is passed as parameter, that condition will be always true. In this case a warning should be emitted."],
		["W1502","Using datetime.time in a boolean context can hide subtle bugs when the time they represent matches midnight UTC. This behaviour was fixed in Python 3.5. See http://bugs.python.org/issue13936 for reference. This message can’t be emitted when using Python >= 3.5."],
		["W1505","The method is marked as deprecated and will be removed in a future version of Python. Consider looking for an alternative in the documentation."],
		//String Constant checker
		["W1402","Used when an escape like u is encountered in a byte string where it has no effect."],
		["W1401","Used when a backslash is in a literal string but not as an escape."],
		//Basic checker
		["E0103","Used when break or continue keywords are used outside a loop."],
		["E0102","Used when a function / class / method is redefined."],
		["E0116","Emitted when the continue keyword is found inside a finally clause, which is a SyntaxError."],
		["E0110","Used when an abstract class with abc.ABCMeta as metaclass has abstract methods and is instantiated."],
		["E0114","Emitted when a star expression is not used in an assignment target. This message can’t be emitted when using Python < 3.0."],
		["E0108","Duplicate argument names in function definitions are syntax errors."],
		["E0101","Used when the special class method __init__ has an explicit return value."],
		["E0112","Emitted when there are more than one starred expressions (*x) in an assignment. This is a SyntaxError. This message can’t be emitted when using Python < 3.0."],
		["E0115","Emitted when a name is both nonlocal and global. This message can’t be emitted when using Python < 3.0."],
		["E0104","Used when a “return” statement is found outside a function or method."],
		["E0106","Used when a “return” statement with an argument is found outside in a generator function or method (e.g. with some “yield” statements). This message can’t be emitted when using Python >= 3.3."],
		["E0113","Emitted when a star expression is used as a starred assignment target. This message can’t be emitted when using Python < 3.0."],
		["E0111","Used when the first argument to reversed() builtin isn’t a sequence (does not implement __reversed__, nor __getitem__ and __len__ ."],
		["E0107","Used when you attempt to use the C-style pre-increment orpre-decrement operator – and ++, which doesn’t exist in Python."],
		["E0105","Used when a “yield” statement is found outside a function or method."],
		["E0100","Used when the special class method __init__ is turned into a generator by a yield in its body."],
		["E0117","Emitted when a nonlocal variable does not have an attached name somewhere in the parent scopes This message can’t be emitted when using Python < 3.0."],
		["W0150","Used when a break or a return statement is found inside the finally clause of a try...finally block: the exceptions raised in the try clause will be silently swallowed instead of being re-raised."],
		["W0199","A call of assert on a tuple will always evaluate to true if the tuple is not empty, and will always evaluate to false if it is."],
		["W0102","Used when a mutable value as list or dictionary is detected in a default value for an argument."],
		["W0109","Used when a dictionary expression binds the same key multiple times."],
		["W0120","Loops should only have an else clause if they can exit early with a break statement, otherwise the statements under else should be on the same scope as the loop itself."],
		["W0106","Used when an expression that is not a function call is assigned to nothing. Probably something else was intended."],
		["W0124","Emitted when a with statement component returns multiple values and uses name binding with as only for a part of those values, as in with ctx() as a, b. This can be misleading, since it’s not clear if the context manager returns a tuple or if the node without a name binding is another context manager."],
		["W0108","Used when the body of a lambda expression is a function call on the same argument list as the lambda itself; such lambda expressions are in all but a few cases replaceable with the function being called in the body of the lambda."],
		["W0104","Used when a statement doesn’t have (or at least seems to) any effect."],
		["W0105","Used when a string is used as a statement (which of course has no effect). This is a particular case of W0104 with its own message so you can easily disable it if you’re using those strings as documentation, instead of comments."],
		["W0107","Used when a “pass” statement that can be avoided is encountered."],
		["W0101","Used when there is some code behind a “return” or “raise” statement, which will never be accessed."],
		["W0123","Used when you use the “eval” function, to discourage its usage. Consider using ast.literal_eval for safely evaluating strings containing Python expressions from untrusted sources."],
		["W0122","Used when you use the “exec” statement (function for Python 3), to discourage its usage. That doesn’t mean you can not use it !"],
		["W0125","Emitted when a conditional statement (If or ternary if) uses a constant value for its test. This might not be what the user intended to do."],
		["W0110","Used when a lambda is the first argument to “map” or “filter”. It could be clearer as a list comprehension or generator expression. This message can’t be emitted when using Python >= 3.0."],
		["C0102","Used when the name is listed in the black list (unauthorized names)."],
		["C0122","Comparison should be %s Used when the constant is placed on the left sideof a comparison. It is usually clearer in intent to place it in the right hand side of the comparison."],
		["C0121","Used when an expression is compared to singleton values like True, False or None."],
		["C0113","Used when a boolean expression contains an unneeded negation."],
		["C0201","Emitted when the keys of a dictionary are iterated through the .keys() method. It is enough to just iterate through the dictionary itself, as in “for key in dictionary”."],
		["C0200","Emitted when code that iterates with range and len is encountered. Such code can be simplified by using the enumerate builtin."],
		["C0112","Used when a module, function, class or method has an empty docstring (it would be too easy ;)."],
		["C0103","Used when the name doesn’t match the regular expression associated to its type (constant, variable, class...)."],
		["C0111","Used when a module, function, class or method has no docstring.Some special methods like __init__ doesn’t necessary require a docstring."],
		["C0123","The idiomatic way to perform an explicit typecheck in Python is to use isinstance(x, Y) rather than type(x) == Y, type(x) is Y. Though there are unusual situations where these give different results."],
		// Newstyle checker
		["E1003"," Used when another argument than the current class is given as first argument of the super builtin."],
		["E1004","Used when the super builtin didn’t receive an argument. This message can’t be emitted when using Python >= 3.0."],
		["E1001","Used when an old style class uses the __slots__ attribute. This message can’t be emitted when using Python >= 3.0."],
		["E1002","Used when an old style class uses the super builtin. This message can’t be emitted when using Python >= 3.0."],
		["W1001","Used when Pylint detect the use of the builtin “property” on an old style class while this is relying on new style classes features. This message can’t be emitted when using Python >= 3.0."],
		["C1001","Used when a class is defined that does not inherit from anotherclass and does not inherit explicitly from “object”. This message can’t be emitted when using Python >= 3.0."],
		//Iterable Check checker
		["E1133","Used when a non-iterable value is used in place whereiterable is expected."],
		["E1134","Used when a non-mapping value is used in place wheremapping is expected."],
		//String checker
		["E1303","Used when a format string that uses named conversion specifiers is used with an argument that is not a mapping."],
		["E1301","Used when a format string terminates before the end of a conversion specifier."],
		["E1304","Used when a format string that uses named conversion specifiers is used with a dictionary that doesn’t contain all the keys required by the format string."],
		["E1302","Used when a format string contains both named (e.g. ‘%(foo)d’) and unnamed (e.g. ‘%d’) conversion specifiers. This is also used when a named conversion specifier contains * for the minimum field width and/or precision."],
		["E1306","Used when a format string that uses unnamed conversion specifiers is given too few arguments"],
		["E1310","The argument to a str.{l,r,}strip call contains a duplicate character,"],
		["E1305","Used when a format string that uses unnamed conversion specifiers is given too many arguments."],
		["E1300","Used when a unsupported format character is used in a format string."],
		["W1305","Usen when a PEP 3101 format string contains both automatic field numbering (e.g. ‘{}’) and manual field specification (e.g. ‘{0}’). This message can’t be emitted when using Python < 2.7."],
		["W1300","Used when a format string that uses named conversion specifiers is used with a dictionary whose keys are not all strings."],
		["W1302","Used when a PEP 3101 format string is invalid. This message can’t be emitted when using Python < 2.7."],
		["W1306","Used when a PEP 3101 format string uses an attribute specifier ({0.length}), but the argument passed for formatting doesn’t have that attribute. This message can’t be emitted when using Python < 2.7."],
		["W1303","Used when a PEP 3101 format string that uses named fields doesn’t receive one or more required keywords. This message can’t be emitted when using Python < 2.7."],
		["W1304","Used when a PEP 3101 format string that uses named fields is used with an argument that is not required by the format string. This message can’t be emitted when using Python < 2.7."],
		["W1301","Used when a format string that uses named conversion specifiers is used with a dictionary that contains keys not required by the format string."],
		["W1307","Used when a PEP 3101 format string uses a lookup specifier ({a[1]}), but the argument passed for formatting doesn’t contain or doesn’t have that key as an attribute. This message can’t be emitted when using Python < 2.7."],
		//Format checker
		["W0311","Used when an unexpected number of indentation’s tabulations or spaces has been found."],
		["W0312","Used when there are some mixed tabs and spaces in a module."],
		["W0301","Used when a statement is ended by a semi-colon (”;”), which isn’t necessary (that’s python, not C ;)."],
		["W0332","Used when a lower case “l” is used to mark a long integer. You should use a upper case “L” since the letter “l” looks too much like the digit “1” This message can’t be emitted when using Python >= 3.0."],
		["C0326","Used when a wrong number of spaces is used around an operator, bracket or block opener."],
		["C0304","Used when the last line in a file is missing a newline."],
		["C0301","Used when a line is longer than a given number of characters."],
		["C0327","Used when there are mixed (LF and CRLF) newline signs in a file."],
		["C0321","Used when more than on statement are found on the same line."],
		["C0302","Used when a module has too much lines, reducing its readability."],
		["C0305","Used when there are trailing blank lines in a file."],
		["C0303","Used when there is whitespace between the end of a line and the newline."],
		["C0328","Used when there is different newline than expected."],
		["C0325","Used when a single item in parentheses follows an if, for, or other keyword."],
		["C0330","The preferred place to break around a binary operator is after the operator, not before it."],
		//Miscellaneous checker
		["C0403","Used when a word in docstring cannot be checked by enchant."],
		["C0401","Used when a word in comment is not spelled correctly."],
		["C0402","Used when a word in docstring is not spelled correctly."],
		//Python3 checker
		["E1603","Python3 will not allow implicit unpacking of exceptions in except clauses. See http://www.python.org/dev/peps/pep-3110/ This message can’t be emitted when using Python >= 3.0."],
		["E1609","Used when the import star syntax is used somewhere else than the module level. This message can’t be emitted when using Python >= 3.0."],
		["E1602","Used when parameter unpacking is specified for a function(Python 3 doesn’t allow it) This message can’t be emitted when using Python >= 3.0."],
		["E1606","Used when “l” or “L” is used to mark a long integer. This will not work in Python 3, since int and long types have merged. This message can’t be emitted when using Python >= 3.0."],
		["E1608","Usen when encountering the old octal syntax, removed in Python 3. To use the new syntax, prepend 0o on the number. This message can’t be emitted when using Python >= 3.0."],
		["E1607","Used when the deprecated “<>” operator is used instead of ”!=”. This is removed in Python 3. This message can’t be emitted when using Python >= 3.0."],
		["E1605","Used when the deprecated “``” (backtick) operator is used instead of the str() function. This message can’t be emitted when using Python >= 3.0."],
		["E1604","Used when the alternate raise syntax ‘raise foo, bar’ is used instead of ‘raise foo(bar)’. This message can’t be emitted when using Python >= 3.0."],
		["E1601","Used when a print statement is used (print is a function in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1623","Used when a metaclass is specified by assigning to __metaclass__ (Python 3 specifies the metaclass as a class statement argument) This message can’t be emitted when using Python >= 3.0."],
		["W1622","Used when an object’s next() method is called (Python 3 uses the next() built- in function) This message can’t be emitted when using Python >= 3.0."],
		["W1620","Used for calls to dict.iterkeys(), itervalues() or iteritems() (Python 3 lacks these methods) This message can’t be emitted when using Python >= 3.0."],
		["W1621","Used for calls to dict.viewkeys(), viewvalues() or viewitems() (Python 3 lacks these methods) This message can’t be emitted when using Python >= 3.0."],
		["W1624","Indexing exceptions will not work on Python 3. Use exception.args[index] instead. This message can’t be emitted when using Python >= 3.0."],
		["W1625","Used when a string exception is raised. This will not work on Python 3. This message can’t be emitted when using Python >= 3.0."],
		["W1611","Used when the StandardError built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1640","Using the cmp argument for list.sort or the sorted builtin should be avoided, since it was removed in Python 3. Using either key or functools.cmp_to_key should be preferred. This message can’t be emitted when using Python >= 3.0."],
		["W1630","Used when a __cmp__ method is defined (method is not used by Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1614","Used when a __coerce__ method is defined (method is not used by Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1615","Used when a __delslice__ method is defined (method is not used by Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1616","Used when a __getslice__ method is defined (method is not used by Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1628","Used when a __hex__ method is defined (method is not used by Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1629","Used when a __nonzero__ method is defined (method is not used by Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1627","Used when a __oct__ method is defined (method is not used by Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1617","Used when a __setslice__ method is defined (method is not used by Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1601","Used when the apply built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1602","Used when the basestring built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1603","Used when the buffer built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1604","Used when the cmp built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1605","Used when the coerce built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1619","Used for non-floor division w/o a float literal or from __future__ import division (Python 3 returns a float for int division unconditionally) This message can’t be emitted when using Python >= 3.0."],
		["W1606","Used when the execfile built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1607","Used when the file built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1639","Used when the filter built-in is referenced in a non-iterating context (returns an iterator in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1618","Used when an import is not accompanied by from __future__ import absolute_import (default behaviour in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1632","Used when the input built-in is referenced (backwards-incompatible semantics in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1634","Used when the intern built-in is referenced (Moved to sys.intern in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1608","Used when the long built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1636","Used when the map built-in is referenced in a non-iterating context (returns an iterator in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1638","Used when the range built-in is referenced in a non-iterating context (returns an iterator in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1609","Used when the raw_input built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1610","Used when the reduce built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1626","Used when the reload built-in function is referenced (missing from Python 3). You can use instead imp.reload or importlib.reload. This message can’t be emitted when using Python >= 3.0."],
		["W1633","Used when the round built-in is referenced (backwards-incompatible semantics in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1635","Used when the unichr built-in is referenced (Use chr in Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1612","Used when the unicode built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1613","Used when the xrange built-in function is referenced (missing from Python 3) This message can’t be emitted when using Python >= 3.0."],
		["W1637","Used when the zip built-in is referenced in a non-iterating context (returns an iterator in Python 3) This message can’t be emitted when using Python >= 3.0."],
		//Logging checker
		["E1201","Used when a logging statement format string terminates before the end of a conversion specifier."],
		["E1206","Used when a logging format string is given too many arguments."],
		["E1205","Used when a logging format string is given too few arguments."],
		["E1200","Used when an unsupported format character is used in a logging statement format string."],
		["W1201","Used when a logging statement has a call form of “logging.<logging method>(format_string % (format_args...))”. Such calls should leave string interpolation to the logging method itself and be written “logging.<logging method>(format_string, format_args...)” so that the program may avoid incurring the cost of the interpolation in those cases in which no message will be logged. For more, see http://www.python.org/dev/peps/pep-0282/."],
		["W1202","Used when a logging statement has a call form of “logging.<logging method>(format_string.format(format_args...))”. Such calls should use % formatting instead, but leave interpolation to the logging function by passing the parameters as arguments."],
		//Typecheck checker
		["E1130","Emitted when an unary operand is used on an object which does not support this type of operation"],
		["E1131","Emitted when a binary arithmetic operation between two operands is not supported."],
		["E1101","Used when a variable is accessed for an unexistent member."],
		["E1102","Used when an object being called has been inferred to a non callable object"],
		["E1124","Used when a function call would result in assigning multiple values to a function parameter, one value from a positional argument and one from a keyword argument."],
		["E1111","Used when an assignment is done on a function call but the inferred function doesn’t return anything."],
		["E1128","Used when an assignment is done on a function call but the inferred function returns nothing but None."],
		["E1129","Used when an instance in a with statement doesn’t implement the context manager protocol(__enter__/__exit__)."],
		["E1132","Emitted when a function call got multiple values for a keyword."],
		["E1125","Used when a function call does not pass a mandatory keyword-only argument. This message can’t be emitted when using Python < 3.0."],
		["E1120","Used when a function call passes too few arguments."],
		["E1126","Used when a sequence type is indexed with an invalid type. Valid types are ints, slices, and objects with an __index__ method."],
		["E1127","Used when a slice index is not an integer, None, or an object with an __index__ method."],
		["E1121","Used when a function call passes too many positional arguments."],
		["E1123","Used when a function call passes a keyword argument that doesn’t correspond to one of the function’s parameter names."],
		["E1135","Emitted when an instance in membership test expression doesn’timplement membership protocol (__contains__/__iter__/__getitem__)"],
		["E1136","Emitted when a subscripted value doesn’t support subscription(i.e. doesn’t define __getitem__ method)"],
		//Classes checker
		["E0203","Used when an instance member is accessed before it’s actually assigned."],
		["E0202","Used when a class defines a method which is hidden by an instance attribute from an ancestor class or set by some client code."],
		["E0237","Used when assigning to an attribute not defined in the class slots."],
		["E0241","Used when a class has duplicate bases."],
		["E0240","Used when a class has an inconsistent method resolutin order."],
		["E0239","Used when a class inherits from something which is not a class."],
		["E0238","Used when an invalid __slots__ is found in class. Only a string, an iterable or a sequence is permitted."],
		["E0236","Used when an invalid (non-string) object occurs in __slots__."],
		["E0211","Used when a method which should have the bound instance as first argument has no argument defined."],
		["E0213","Used when a method has an attribute different the “self” as first argument. This is considered as an error since this is a so common convention that you shouldn’t break it!"],
		["E0302","Emitted when a special method was defined with an invalid number of parameters. If it has too few or too many, it might not work at all."],
		["E0301","Used when an __iter__ method returns something which is not an iterable (i.e. has no next method)."],
		["E0303","Used when an __len__ method returns something which is not a non-negative integer."],
		["W0212","Used when a protected member (i.e. class member with a name beginning with an underscore) is access outside the class or a descendant of the class where it’s defined."],
		["W0221","Used when a method has a different number of arguments than in the implemented interface or in an overridden method."],
		["W0201","Used when an instance attribute is defined outside the __init__ method."],
		["W0232","Used when a class has no __init__ method, neither its parent classes."],
		["W0223","Used when an abstract method (i.e. raise NotImplementedError) is not overridden in concrete class."],
		["W0222","Used when a method signature is different than in the implemented interface or in an overridden method."],
		["W0211","Used when a static method has “self” or a value specified in valid- classmethod-first-arg option or valid-metaclass-classmethod-first-arg option as first argument."],
		["W0233","Used when an __init__ method is called on a class which is not in the direct ancestors for the analysed class."],
		["W0231","Used when an ancestor class method has an __init__ method which is not called by a derived class."],
		["R0202","Used when a class method is defined without using the decorator syntax."],
		["R0203","Used when a static method is defined without using the decorator syntax."],
		["R0201","Used when a method doesn’t use its bound instance, and so could be written as a function."],
		["C0202","Used when a class method has a first argument named differently than the value specified in valid-classmethod-first-arg option (default to “cls”), recommended to easily differentiate them from regular instance methods."],
		["C0204","Used when a metaclass class method has a first argument named differently than the value specified in valid-metaclass-classmethod-first-arg option (default to “mcs”), recommended to easily differentiate them from regular instance methods."],
		["C0203","Used when a metaclass method has a first agument named differently than the value specified in valid-classmethod-first-arg option (default to “cls”), recommended to easily differentiate them from regular instance methods."],
		["F0202","Used when Pylint has been unable to check methods signature compatibility for an unexpected reason. Please report this kind if you don’t make sense of it."],
		//Similarities checker
		["E0701","Used when except clauses are not in the correct order (from the more specific to the more generic). If you don’t fix the order, some exceptions may not be catched by the most specific handler."],
		["E0712","Used when a class which doesn’t inherit from BaseException is used as an exception in an except clause."],
		["E0703","Used when using the syntax “raise ... from ...”, where the exception context is not an exception, nor None. This message can’t be emitted when using Python < 3.0."],
		["E0711","Used when NotImplemented is raised instead of NotImplementedError."],
		["E0702","Used when something which is neither a class, an instance or a string is raised (i.e. a TypeError will be raised)."],
		["E0710","Used when a new style class which doesn’t inherit from BaseException is raised."],
		["E0704","Used when a bare raise is not used inside an except clause. This generates an error, since there are no active exceptions to be reraised. An exception to this rule is represented by a bare raise inside a finally clause, which might work, as long as an exception is raised inside the try block, but it is nevertheless a code smell that must not be relied upon."],
		["W0705","Used when an except catches a type that was already caught by a previous handler."],
		["W0703","Used when an except catches a too general exception, possibly burying unrelated errors."],
		["W0710","Used when a custom exception class is raised but doesn’t inherit from the builtin “Exception” class. This message can’t be emitted when using Python >= 3.0."],
		["W0711","Used when the exception to catch is of the form “except A or B:”. If intending to catch multiple, rewrite as “except (A, B):”"],
		["W0702","Used when an except clause doesn’t specify exceptions type to catch."],
		//Async checker
		["E1701","Used when an async context manager is used with an object that does not implement the async context management protocol. This message can’t be emitted when using Python < 3.5."],
		["E1700","Used when an yield or yield from statement is found inside an async function. This message can’t be emitted when using Python < 3.5."]
	];
	for( var i = 0, len = list.length; i < len; i++ ) {
	    if( list[i][0] === id ) {
	        return list[i][1];
	    }
	}
	return "No information at the moment";
}
}


