publicsuffix-js
===============

Implements the algorithm to distinguish separate domains (for example browsers
need to know that for their cookies and authorization models). Unfortunately
there is no better algorithm than looking-up a published list.

See http://publicsuffix.org/ for more details.

Have fun,
  Jonas

Licence
-------

All code of this project is in public domain. 
It is assumed that contributors loose their copyrights on code they contribute.
See http://unlicence.org for more details.

Ideas for later (or if you want to help)
---------------

Changing the list to a reverse hash tree could be more space efficient.
Lookup would maybe also be faster, but there is not efficiency problem for
me.
A hash tree like {uk: {co: ... 
