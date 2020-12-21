### Global Node Cache (GNC)
Allow storing processed, repeat processed data, initialized classes on to global or local variable
- Global variable: node `global.gnc={}`
- local variable: node `const GNC={}` stored at top of application scope

### Why use it
- your application makes high computations, and repeated tasks that can be cached to save process/memory