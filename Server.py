from BaseHTTPServer import HTTPServer
from CGIHTTPServer import CGIHTTPRequestHandler
from SocketServer import ThreadingMixIn
import threading

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""

# type ip and port number in 'your_ip' and port_num
    
if __name__ == '__main__':
    server = ThreadedHTTPServer(('your_ip', port_num), CGIHTTPRequestHandler)
    print 'Starting server, use <Ctrl-C> to stop'
    server.serve_forever()
