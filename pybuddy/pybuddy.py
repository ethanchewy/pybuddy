"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, Integer
from xblock.fragment import Fragment
from django.http import JsonResponse, HttpRequest
from pylint import lint
from astroid import MANAGER
from pylint.reporters.text import TextReporter
from subprocess import Popen, PIPE, STDOUT

class PythonBuddyXBlock(XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    # TO-DO: delete count, and define your own fields.
    count = Integer(
        default=0, scope=Scope.user_state,
        help="A simple counter, to show something happening",
    )

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    # TO-DO: change this view to display your data your own way.
    def student_view(self, context=None):
        """
        The primary view of the PythonBuddyXBlock, shown to students
        when viewing courses.
        """
        html = self.resource_string("static/html/index.html")
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/bootstrap.min.css"))
        frag.add_css(self.resource_string("static/css/style.css"))
        frag.add_css(self.resource_string("static/codemirror/lib/codemirror.css"))
        frag.add_css(self.resource_string("static/codemirror/lib/lint.css"))
        frag.add_css(self.resource_string("static/codemirror/addon/dialog.css"))

        frag.add_javascript(self.resource_string("static/js/jquery.js"))
        frag.add_javascript(self.resource_string("static/codemirror/lib/codemirror.js"))
        frag.add_javascript(self.resource_string("static/codemirror/lib/python.js"))
        frag.add_javascript(self.resource_string("static/codemirror/lib/lint.js"))
        frag.add_javascript(self.resource_string("static/js/cm-validator-remote.js"))
        frag.add_javascript(self.resource_string("static/codemirror/addon/search.js"))
        frag.add_javascript(self.resource_string("static/codemirror/addon/searchcursor.js"))
        frag.add_javascript(self.resource_string("static/codemirror/addon/dialog.js"))
        frag.add_javascript(self.resource_string("static/js/javascript.js"))
        frag.initialize_js('PythonBuddyXBlock')
        return frag

    # TO-DO: change this handler to perform your own actions.  You may need more
    # than one handler, or you may not need any handlers at all.
    '''
    @XBlock.json_handler
    def increment_count(self, data, suffix=''):
        """
        An example handler, which increments the data.
        """
        # Just to show data coming in...
        assert data['hello'] == 'world'

        self.count += 1
        return {"count": self.count}
    '''

    @XBlock.json_handler
    def check_code(self, data, suffix=''):
        print "hi123"
        #Get textarea text from AJAX call
        text = data['text']
        print "hello"

        #Open temp file which will be parsed

        #changed to w+ from r+ originally
        f = open("error_test.py","w+")
        f.seek(0)
        f.write(text)
        f.truncate()
        f.close()

        #Writable Object that will be used as a TextReporter
        class WritableObject(object):
            def __init__(self):
                self.content = []
            def write(self, st):
                self.content.append(st)
            def read(self):
                return self.content

        #Remember that you can configure with a seperate file for more specific limitations => --rcfile=/path/to/config.file . 
        #See http://stackoverflow.com/a/10138997/4698963
        #Add "--disable=R,C" to ARGs to print only errors & warnings
        ARGS = ["-r","n", "--disable=R,C","--msg-template={path}:{line}: [{msg_id}({symbol}), {obj}] {msg}"]

        pylint_output = WritableObject()
        #Run Pylint, textreporter will redirect to writable object
        lint.Run(["error_test.py"]+ARGS, reporter=TextReporter(pylint_output), exit=False)
        pylint_list = pylint_output.content
        #Clear Cache. VERY IMPORTANT! This will make sure that there's no funky issues. See: http://stackoverflow.com/questions/2028268/invoking-pylint-programmatically#comment5393474_4803466 
        MANAGER.astroid_cache.clear()


        #Return json object, which is the pylint_output seperated by each newline
        return pylint_list

    #@XBlock.json_handler
    @XBlock.json_handler
    def run_code(self, data, suffix=''):
        print "run_test"

        #Remember file path depends on Operating System 
        cmd = 'python error_test.py'
        p = Popen(cmd, shell=True, stdin=PIPE, stdout=PIPE, stderr=STDOUT, close_fds=True)
        output = p.stdout.read()
        print "output" + output
        return JsonResponse(output)

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("PythonBuddyXBlock",
             """<pybuddy/>
             """),
            ("Multiple PythonBuddyXBlock",
             """<vertical_demo>
                <pybuddy/>
                <pybuddy/>
                <pybuddy/>
                </vertical_demo>
             """),
        ]
