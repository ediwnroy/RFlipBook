(function (global) {

    function RFlipBook(control, pluginOptions) {
        var _this = this;

        const RIGHT = "RIGHT";
        const LEFT = "LEFT";
        const BOOKPAGECLASSNAME = "r-book-page";
        const BOOKPAGECONTENTCLASSNAME = "r-page-content";
        const VELOCITY = 1;
        const MAXDEG = 90;

        var _this = this;
        var scrolling = false;
        var initialX;
        var initialY;
        var currentScroll = 0;
        var startDeg = 0;
        var startXPos = 0;
        var startYPos = 0;
        var lastPosition;
        var lastPositionX;
        var direction;
        var itemWidth;

        this.isDragging;
        this.items;
        this.wrapItem;
        this.totalItemCount;
        this.initPosition = 0;
        this.lastPosition = 0;
        this.currentPosition = 0;

        this.init = function () {
            initPlugin();
        };

        this.destroy = function () {
            destroyPlugin();
        }

        /******************************** */
        /******************************** */
        /******************************** */

        function initPlugin() {

            setItems();

            setGeneralEvents();
        }

        function destroyPlugin() {
            clearEvents();
        }

        function setGeneralEvents() {
            setTouchEvents()
        }

        function setItems() {
            _this.items = [].slice.call(control.getElementsByClassName(BOOKPAGECLASSNAME));

            itemWidth = control.offsetWidth;

            _this.items.forEach((element, i) => {
                element.style.zIndex = _this.items.length - i;

                element.style.clip = `rect(0,${element.offsetWidth}px,${element.offsetHeight}px,0)`;
            });
        }

        function setTouchEvents() {
            control.addEventListener("mousedown", mouseDownElement);
            control.addEventListener("touchstart", mouseDownElement);

            window.addEventListener("mouseup", mouseUpElement);
            window.addEventListener("touchend", mouseUpElement);

            document.addEventListener("mousemove", documentMouseMove);
            document.addEventListener("touchmove", documentMouseMove);
        }

        /** Inicializa las variables de la posicion actual del mouse */
        function mouseDownElement(e) {

            if (e.currentTarget == 'INPUT')
                return;

            scrolling = true;
            _this.isDragging = false;

            initialX = getTouchScreen(e).pageX;
            initialY = getTouchScreen(e).pageY;

            currentScroll = lastPosition || currentScroll;
        }

        /**  */
        function mouseUpElement(e) {
            lockScroll = null;
            startDeg = null;
            startXPos = null;
            startYPos = null;

            if (!scrolling)
                return;

            scrolling = false;
        }

        /**Mueve el mouse elemento cuando se mueve el mouse */
        function documentMouseMove(e) {
            if (!scrolling)
                return;

            let screen = getTouchScreen(e);

            _this.isDragging = _this.isDragging || Math.abs(screen.screenX - initialX) > 5;


            animatePage(e);
        }

        /**Actualiza la posicion de elemento */
        const SMOOTHDEG = 0.3;
        const SMOOTHPAGE = 1;
        function animatePage(e) {
            let screen = getTouchScreen(e);
            let x = (screen.pageX - initialX);
            let y = (screen.pageY - initialY);
            let page = getNextPage();
            let pageContent = getNextPage().querySelector(`.${BOOKPAGECONTENTCLASSNAME}`);

            savePositions(page);

            let deg = startDeg - (y * SMOOTHDEG);
            // let top = (startXPos + (x * SMOOTHPAGE))+( (screen.pageX + initialX))+(page.offsetWidth/2);
            D = {
                x: 0 - (control.offsetWidth /2),
                y: (page.offsetHeight/2) -  initialY
            };
            let top = E(D, initialY)
            let left = (startXPos + (x * SMOOTHPAGE));

            let percentage = Math.max(0, Math.min(.5, 1 - (screen.pageY - getTop(control)) / page.offsetHeight));

            let ratioX = (percentage) * (page.offsetWidth/2);

            var offSety  = top *percentage;
            var radiant = deg * (Math.PI / 180);
            page.style.transform = `translate(${(Math.cos(radiant) * left).toFixed(5)}px, ${(Math.sin(radiant) * left).toFixed(5)}px) rotate(${deg}deg)`;
        }

        /*
        l.x+a.x+(b / 2)

a.x = initialX;
n = initialY;
b = a.page.pageWidth;



          L.x + k + d + .5;


 D = {
                x: (a.corner) - (a.page.pageWidth / 2),
                y: (a.page.pageHeight/2) -  a.page.data("grabPoint")
            };

 E(D, initialY)

 function E(a, b) {
        var c = Math.cos(b),
            d = Math.sin(b);
        return {
            x: c * a.x - d * a.y,
            y: d * a.x + c * a.y
        }
    }
        */

        function E(a, b) {
            var c = Math.cos(b),
                d = Math.sin(b);
            return {
                x: c * a.x - d * a.y,
                y: d * a.x + c * a.y
            }
        }

        function getTop(page) {
            return page.getBoundingClientRect().top + window.scrollY;
        }

        function savePositions(page) {
            if (startDeg == null)
                startDeg = getRotationDegree(page);

            if (startXPos == null)
                startXPos = getTranslate(page, 'x');

            if (startYPos == null)
                startYPos = getTranslate(page, 'y');
        }

        function keepPositionContent(pageContent, screen, leftPage, topPage, deg) {
            let inverseLeft = -leftPage;
            let inverseTop = -topPage;
            let inverseDeg = -deg;

            let radians = (inverseDeg * Math.PI) / 180;
            let cosTheta = Math.cos(radians);
            let sinTheta = Math.sin(radians);

            let offsetX = inverseLeft * cosTheta - inverseTop * sinTheta;
            let offsetY = inverseLeft * sinTheta + inverseTop * cosTheta;

            pageContent.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${-deg}deg)`;
        }

        function dragPoint(x, y, prefix, parent, color) {
            let className = `${(prefix || '')}r-point`;
            let point = document.querySelector(`.${className}`);

            if (!point) {
                point = document.createElement("DIV");
                point.style.backgroundColor = color || 'green';
                point.style.position = 'absolute';
                point.style.zIndex = '100000';
                point.style.width = '10px';
                point.style.height = '10px';
                point.style.borderRadius = '10rem';
                point.classList.add(className);

                (parent || document.body).append(point);
            }

            point.style.top = y - 5;
            point.style.left = x - 5;
        }

        function getTranslate(element, axis) {
            var computedStyle = window.getComputedStyle(element);
            var transformValue = computedStyle.getPropertyValue('transform');
            if (transformValue === 'none') {
                return 0; // Si no hay transformación, devuelve 0
            }

            // Extrae la matriz de transformación y obtén la posición X o Y según el eje especificado
            var matrix = transformValue.split('(')[1].split(')')[0].split(',');
            var translateValue = 0;

            if (axis === 'x') {
                translateValue = parseFloat(matrix[4]); // La posición X se encuentra en la cuarta posición
            } else if (axis === 'y') {
                translateValue = parseFloat(matrix[5]); // La posición Y se encuentra en la quinta posición
            }

            return translateValue;
        }

        function getRotationDegree(page) {
            try {
                var computedStyle = window.getComputedStyle(page);
                var transformValue = computedStyle.getPropertyValue('transform');
                if (transformValue === 'none') {
                    return 0; // Si no hay rotación, devuelve 0 grados
                }

                // Extrae la rotación en radianes desde la matriz de transformación
                var matrix = transformValue.split('(')[1].split(')')[0].split(',');
                var a = matrix[0];
                var b = matrix[1];
                var radians = Math.atan2(b, a);

                // Convierte los radianes a grados y devuelve el valor
                var degrees = Math.round(radians * (180 / Math.PI));
                return degrees;
            } catch (e) {
                return 0;
            }
        }

        function getNextPage() {
            return _this.items[0];
        }


        function getLeft(item) {
            return item.transformX || 0;
        }

        function clearEvents() {
            control.onscroll = null;

            control.removeEventListener("mousedown", mouseDownElement);
            control.removeEventListener("touchstart", mouseDownElement);

            window.removeEventListener("mouseup", mouseUpElement);
            window.removeEventListener("touchend", mouseUpElement);

            document.removeEventListener("mousemove", documentMouseMove);
            document.removeEventListener("touchmove", documentMouseMove);

            window.removeEventListener("resize", resizeWindow);
        }

        function getTouchScreen(e) {
            var touch = {};

            if (e.touches)
                return {
                    hasTouch: e.type === "touchend" || e.type === "mouseup",
                    screenX: VELOCITY * (e.touches.length > 0 ? e.touches[0].clientX : 0),
                    screenY: e.touches.length > 0 ? e.touches[0].clientY : 0,
                    pageX: e.touches.length > 0 ? e.touches[0].pageX : 0,
                    pageY: e.touches.length > 0 ? e.touches[0].pageY : 0
                };

            touch.hasTouch = true;
            touch.screenX = e.screenX * VELOCITY;
            touch.screenY = e.screenY;
            touch.pageX = e.pageX;
            touch.pageY = e.pageY;

            return touch;
        }
    }

    function animateCube(animate, callback, delay = 400, factor = null) {
        var i = 1 - factor;

        return new Promise(function (resolve, reject) {
            {
                if (!animate) {
                    callback(1);
                    resolve();

                    return;
                }

                let Animation = new SetAnimation(pluginOptions.delay || delay, function (percentage) {
                    if (percentage === true) {
                        callback(factor);
                        resolve();
                        return;
                    }
                    if (factor === 1)
                        callback(percentage);
                    else
                        callback(i - percentage);

                    if (percentage === 1) {
                        callback(factor);
                        resolve();
                    }
                }, linear, factor === null ? 0 : 1);

                Animation.Init();
            }
        });
    }

    function SetAnimation(ms, callback, anim, factor = 1) {

        this.start = new Date().getTime();
        let _this = this;

        this.Init = function () {
            animating = true;
            setTimeout(function () {

                if (scrolling || cancelAnimation) {
                    cancelAnimation = false;
                    animating = false;
                    return callback(true);
                }

                if (!_this.Next()) {
                    cancelAnimation = false;
                    animating = false;
                    callback(factor === null ? 0 : 1);

                    return;
                }
                else {
                    callback(_this.Next());
                }
                _this.Init();
            }, 3);
        }

        this.Next = function () {
            let now = new Date().getTime();
            let lapse = now - _this.start;

            if (lapse >= ms)
                return false;

            return anim(lapse / ms);
        }
    }

    function linear(p) {
        return p;
    }

    // Maneja la exportación según el entorno (Node.js o navegador)
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // Entorno Node.js
        module.exports = RFlipBook;
    } else {
        // Entorno del navegador
        global.RFlipBook = RFlipBook;
    }
})(typeof global !== 'undefined' ? global : this);