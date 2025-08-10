```
+------------------------+           +------------------------+
|                        |           |                        |
|     Main Web Server    |           |    Local CMS Backend   |
|    (Port 8080)         |           |    (Port 8082)         |
|                        |           |                        |
+------------------------+           +------------------------+
            ^                                    ^
            |                                    |
            |      +------------------------+    |
            +------|                        |----+
                   |    Browser Interface   |
                   |                        |
                   +------------------------+
                              |
                              v
                   +------------------------+
                   |                        |
                   |     File System        |
                   |  (_data/ & _content/)  |
                   |                        |
                   +------------------------+

Architecture:
1. Browser loads admin interface from main server (port 8080)
2. CMS interface makes API calls to local backend (port 8082)
3. Local backend reads/writes files directly to the file system
4. Main server serves the updated content
```
