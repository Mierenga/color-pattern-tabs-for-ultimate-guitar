Chrome extension that removes all the clutter from Ultimate Guitar tabs and uses color to enhance your pattern recognition.

## Before
![](screenshots/before.png?raw=true)
## After
![](screenshots/after1.png?raw=true)
![](screenshots/after2.png?raw=true)

# Now available as a chrome extension at: https://chrome.google.com/webstore/detail/colorized-tabs-for-ultima/dallnmljjnjlfgcljhjahhhdfpojnbfc


# Potentials

- [X] Handle 2-digit frets with single color
- [X] Fix formatting of auxilliary tables under center-align
- [ ] Scrape title and insert if not already present in raw tablature
- [ ] Improve scrolling capabilities
- [ ] Scroll-map sidebar

- Options menu
    - Colors
        - [x] hide colors
        - [ ] randomize color order
        - [ ] rotate color order
        - [x] choose color pallete
        - [ ] outline only
        - [x] choose background color
    - Text
        - [x] choose left, center, or right align
        - [x] set font size
        - [x] set font
    - CSS
        - [ ] border radius of chronos
    - [x] Save options to local storage (maybe can use dat.gui localStorage feature, not sure if it works OOTB in extension context)

- [ ] Pull down ribbon to activate from UG
    - https://lab.hakim.se/forkit-js/
    - https://github.com/hakimel/forkit.js
