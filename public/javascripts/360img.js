var threeSixty = function () {
    return {
        init: function (config) {
            this._noPhotos = config.noPhotos;
            this._preLoadImage();
            if (config.stImg) this._stImg = parseInt(config.stImg);
            if (config.speed) this._speed = parseInt(config.speed);
            return this;
        },

        _initFirstImg: function () {
            this._loadingEle.style.display = 'none';
            this._mainEle.style.display = 'block';
            this._imgWidth = this._imgArr[0].width;
            this._setImg(this._stImg);
            this._initAbsDiv();
            this._mouseListener();
            this._touchListener();
            // this._btnListener();
            this._wheelListener();
            this._autoRotate(!this._isRotateLeft);
            this._zoomControl = ZoomControl().init();
        },

        _wheelListener: function () {
            var _this = this;
            [this._divEle, this._zoomEle].forEach(function (el) {
                el.onmousewheel = function (evt) {
                    _this._speed = 0;
                    if (evt.wheelDelta > 0) {
                        _this._nextImg();
                    } else {
                        _this._pastImg();
                    }
                }
            })
        },

        _initAbsDiv: function () {
            var width = this._threeSixtyEle.width;
            var height = this._threeSixtyEle.height;
            console.log([width, height].join(" "));
            [this._divEle, this._containerEle, this._mainEle, this._zoomEle].forEach(function (el) {
                el.style.width = width + 'px';
                el.style.height = height + 'px';
            });
        },

        _btnListener: function () {
            var _this = this;
            var rotataBtnClicked = function (isLeft) {
                if (_this._isRotateLeft == isLeft) {
                    _this._speed++;
                } else {
                    _this._isRotateLeft = !_this._isRotateLeft;
                    _this._speed = 0;
                }
                _this._autoRotate(!_this._isRotateLeft);
            }
            this._leftBtn.onclick = function () {
                rotataBtnClicked(true);
            }
            this._rightBtn.onclick = function () {
                rotataBtnClicked(false);
            }
            this._mainEle.onmouseover = function () {
                _this._toolBarEle.className = 'over';
            }
            this._mainEle.onmouseleave = function () {
                _this._toolBarEle.className = '';
            }
        },

        _speed2Time: function () {
            var speed = this._speed;
            var MAX = 3;
            if (speed >= MAX) speed = MAX;
            if (speed <= 0) speed = 0;
            this._speed = speed;
            if (this._imgArr.length >= 72) {
                return 150 / speed / this._imgArr.length * 72;
            } else {
                return 150 / speed;
            }
        },

        _autoRotate: function (isNext) {
            var _this = this;
            var rotate = function () {
                var time = _this._speed2Time();
                clearInterval(_this._rotateInt);
                if (!_this._speed) return;
                _this._rotateInt = setTimeout(function () {
                    isNext ? _this._nextImg() : _this._pastImg();
                    rotate();
                }, time);
            }
            rotate();
        },

        _touchListener: function () {
            var _this = this;
            var startX;
            var downDate;
            var DIST = Math.round(this._imgWidth / this._noPhotos * 2);
            this._divEle.ontouchstart = function (e) {
                downDate = new Date();
                var touchobj = e.touches[0];
                startX = touchobj.clientX;
                _this._speed = 0;
                e.preventDefault();
            };
            this._divEle.ontouchmove = function (e) {
                e.preventDefault();
                var touchobj = e.touches[0];
                var moveX = touchobj.clientX;

                while (moveX - startX > DIST) {
                    _this._nextImg();
                    startX += DIST;
                }
                while (startX - moveX > DIST) {
                    _this._pastImg();
                    startX -= DIST;
                }

            };
            this._divEle.ontouchend = function (e) {
                e.preventDefault();
                var timeDif = -(startX - e.changedTouches[0].pageX) / (downDate - new Date()) * 10;
                console.log(timeDif);
                if (timeDif > 0.3) {
                    _this._keepMoving(timeDif, false);
                } else if (timeDif < -0.3) {
                    _this._keepMoving(timeDif * -1, true);
                }

            }
        },

        _mouseListener: function () {
            var _this = this;
            var clicking = false;
            var pastClientX = false;
            var downClientX = false;
            var downDate = false;
            var DIST = Math.round(this._imgWidth / this._noPhotos * 2);

            this._divEle.onmousedown = function (e) {
                console.log('mousedown');
                pastClientX = e.clientX;
                downClientX = e.clientX;
                downDate = new Date();
                clicking = true;
                _this._speed = 0;
            }
            this._divEle.onmouseup = function (e) {
                clicking = false;
                var timeDif = (e.clientX - downClientX) / (downDate - new Date());
                console.log(timeDif);
                if (timeDif > 0.3) {
                    _this._keepMoving(timeDif, false);
                } else if (timeDif < -0.3) {
                    _this._keepMoving(timeDif * -1, true);
                }
            }
            this._divEle.onmouseleave = function (e) {
                clicking = false;
            }
            this._divEle.onmousemove = function (e) {
                if (clicking) {
                    while (e.clientX - pastClientX > DIST) {
                        _this._nextImg();
                        pastClientX += DIST;
                    }
                    while (pastClientX - e.clientX > DIST) {
                        _this._pastImg();
                        pastClientX -= DIST;
                    }
                }
            }
        },

        _keepMoving: function (timeDif, isNext) {
            var _this = this;
            var TIME_DIF_FACTOR = 30;
            var TIME_MOVE_ITF = 100;
            var interval = false;

            timeDif = timeDif * TIME_DIF_FACTOR;

            var move = function (time) {
                if (time < 1) return;
                clearInterval(interval);
                isNext ? _this._nextImg() : _this._pastImg();
                interval = setInterval(function () {
                    move(time - 1);
                }, TIME_MOVE_ITF / time / time);
            }
            move(timeDif);
        },

        _preLoadImage: function () {
            var _this = this;
            var noPhotos = this._noPhotos;
            var noImgLoaded = 0;
            for (var i = 1; i <= noPhotos; i++) {
                var img = new Image();
                img.onload = function () {
                    noImgLoaded++;
                    if (noImgLoaded == noPhotos) {
                        _this._initFirstImg();
                    }
                }
                img.src = "/images/frame-" + i + ".jpg";
                this._imgArr.push(img);
            }
        },
        _nextImg: function () {
            this._currPos++;
            if (this._currPos == this._imgArr.length) this._currPos = 0;
            this._setImg(this._currPos);
        },
        _pastImg: function () {
            this._currPos--;
            if (this._currPos == -1) this._currPos = this._imgArr.length - 1;
            this._setImg(this._currPos);
        },
        _setImg: function (pos) {
            this._threeSixtyEle.src = this._imgArr[pos].src;
            this._currPos = pos;
        },
        _speed: 0,
        _stImg: 0,
        _currPos: 0,
        _imgArr: [],
        _imgWidth: false,
        _noPhotos: false,
        _rotateInt: false,
        _isRotateLeft: true,
        _zoomControl: false,
        _divEle: document.getElementById('absDiv'),
        _zoomEle: document.getElementById('zoomDiv'),
        _mainEle: document.getElementById('main'),
        _leftBtn: document.getElementById('rleft'),
        _rightBtn: document.getElementById('rright'),
        _zoomInBtn: document.getElementById('zoomIn'),
        _zoomOutBtn: document.getElementById('zoomOut'),
        _toolBarEle: document.getElementById('toolBar'),
        _threeSixtyEle: document.getElementById('360img'),
        _containerEle: document.querySelector('.layer-Container'),
        _loadingEle:document.getElementById('loading')
    }
}

var ZoomControl = function () {
    return {
        init: function () {
            var _this = this;
            var twidth = this._widthLevel[0] = this._threeSixtyEle.width;
            var theight = this._heightLevel[0] = this._threeSixtyEle.height;
            for (var i = 1; i < this._MAX_LEVEL; i++) {
                this._widthLevel[i] = twidth = twidth * this._ZOOM_FACTOR;
                this._heightLevel[i] = theight = theight * this._ZOOM_FACTOR;
            }
            this._zoomEle.style.display = 'none';
            // this._zoomInBtn.onclick = function () {
            //     _this.zoomIn();
            // };
            // this._zoomOutBtn.onclick = function () {
            //     _this.zoomOut();
            // };
            this._mouseListener();
            // if (this._level == 0) this._zoomOutBtn.disabled = true;
            return this;
        },
        zoomIn: function () {
            if (parseInt(this._level) >= this._MAX_LEVEL - 1) return;
            this._level = parseInt(this._level) + 1;
            console.log(this._level);
            this._threeSixtyEle.width = this._widthLevel[this._level];
            this._threeSixtyEle.height = this._heightLevel[this._level];
            this._afterZoom();
        },
        zoomOut: function () {
            if (parseInt(this._level) <= 0) return;
            this._level = parseInt(this._level) - 1;
            console.log(this._level);
            this._threeSixtyEle.width = this._widthLevel[this._level];
            this._threeSixtyEle.height = this._heightLevel[this._level];
            this._afterZoom();
        },
        _afterZoom: function () {
            var top = -(this._heightLevel[this._level] - this._heightLevel[0]) / 2;
            var left = -(this._widthLevel[this._level] - this._widthLevel[0]) / 2;
            console.log([left, top].join(' '));
            this._threeSixtyEle.style.top = top + 'px';
            this._threeSixtyEle.style.left = left + 'px';
            this._zoomInBtn.disabled = (this._level == this._MAX_LEVEL - 1);
            this._zoomOutBtn.disabled = (this._level == 0);
            this._zoomEle.style.display = (this._level == 0 ? 'none' : 'block');
        },
        _mouseListener: function () {
            var _this = this;
            var clicking = false;
            var downX = 0;
            var downY = 0;
            var downT = 0;
            var downL = 0;
            this._zoomEle.onmousedown = function (evt) {
                if (clicking) return;
                clicking = true;
                downX = evt.clientX;
                downY = evt.clientY;
                downT = parseInt(_this._threeSixtyEle.style.top);
                downL = parseInt(_this._threeSixtyEle.style.left);
                console.log(downX + ' ' + downY);
            };
            this._zoomEle.onmousemove = function (evt) {
                if (!clicking) return;
                var top = downT + evt.clientY - downY;
                var left = downL + evt.clientX - downX;
                var offLeft = _this._widthLevel[_this._level] - _this._widthLevel[0];
                var offTop = _this._heightLevel[_this._level] - _this._heightLevel[0];
                if (top < -offTop) top = -offTop;
                if (left < -offLeft) left = -offLeft;
                if (top > offTop) top = offTop;
                if (left > offLeft) left = offLeft;
                _this._threeSixtyEle.style.top = top + 'px';
                _this._threeSixtyEle.style.left = left + 'px';
            };
            this._zoomEle.onmouseleave = function (evt) {
                clicking = false;
            };
            this._zoomEle.onmouseup = function (evt) {
                clicking = false;
            };
            this._zoomEle.onmouseleave = function (evt) {
                clicking = false;
            };

        },
        _MAX_LEVEL: 5,
        _ZOOM_FACTOR: 1.1,
        _level: 0,
        _widthLevel: [],
        _heightLevel: [],
        _zoomEle: document.getElementById('zoomDiv'),
        _zoomInBtn: document.getElementById('zoomIn'),
        _zoomOutBtn: document.getElementById('zoomOut'),
        _threeSixtyEle: document.getElementById('360img')
    }
}