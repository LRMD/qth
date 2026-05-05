
function OSMPoint(x, y) { this.x = x; this.y = y; }
function OSMSize(width, height) { this.width = width; this.height = height; }
function OSMLatLng(lat, lng) { this._lat = parseFloat(lat); this._lng = parseFloat(lng); }
OSMLatLng.prototype.lat = function() { return this._lat; };
OSMLatLng.prototype.lng = function() { return this._lng; };
function toLeafletLatLng(point) { return [point.lat(), point.lng()]; }
function makeLeafletIcon(icon) {
    if (!icon) return null;
    if (icon == "line_namai.png") return L.icon({ iconUrl: icon, iconSize: [20, 34], iconAnchor: [10, 34] });
    if (typeof icon == "string") return L.icon({ iconUrl: icon, iconSize: [16, 16], iconAnchor: [8, 8] });
    return L.icon({
        iconUrl: icon.url,
        iconSize: icon.size ? [icon.size.width, icon.size.height] : [16, 16],
        iconAnchor: icon.anchor ? [icon.anchor.x, icon.anchor.y] : [8, 8]
    });
}
function OSMMarkerImage(url, size, origin, anchor, scaledSize) {
    this.url = url; this.size = scaledSize || size; this.anchor = anchor;
}
function OSMMap(element, options) {
    var leafletMap = L.map(element, { zoomControl: false, tap: false }).setView(toLeafletLatLng(options.center), options.zoom);
    L.control.zoom({ position: "topright" }).addTo(leafletMap);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(leafletMap);
    leafletMap.setCenter = function(point) { leafletMap.panTo(toLeafletLatLng(point)); };
    return leafletMap;
}
function OSMMarker(options) {
    var markerOptions = {};
    var icon = makeLeafletIcon(options.icon);
    if (icon) markerOptions.icon = icon;
    var marker = L.marker(toLeafletLatLng(options.position), markerOptions);
    marker.position = options.position;
    marker.setPosition = function(point) { marker.position = point; marker.setLatLng(toLeafletLatLng(point)); };
    marker.setMap = function(targetMap) {
        if (targetMap) marker.addTo(targetMap);
        else if (map && map.hasLayer(marker)) map.removeLayer(marker);
    };
    if (options.map) marker.addTo(options.map);
    return marker;
}
function OSMPolyline(options) {
    var polyline = L.polyline(options.path.map(toLeafletLatLng), {
        color: options.strokeColor,
        opacity: options.strokeOpacity,
        weight: options.strokeWeight
    });
    polyline.setMap = function(targetMap) {
        if (targetMap) polyline.addTo(targetMap);
        else if (map && map.hasLayer(polyline)) map.removeLayer(polyline);
    };
    return polyline;
}
function computeDistanceBetween(from, to) {
    return L.latLng(from.lat(), from.lng()).distanceTo(L.latLng(to.lat(), to.lng()));
}
function computeHeading(from, to) {
    var lat1 = from.lat().toRad();
    var lat2 = to.lat().toRad();
    var dLon = (to.lng() - from.lng()).toRad();
    return Math.atan2(Math.sin(dLon) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)).toDeg();
}
var osm = { maps: {
    LatLng: OSMLatLng,
    Point: OSMPoint,
    Size: OSMSize,
    MarkerImage: OSMMarkerImage,
    Marker: OSMMarker,
    Polyline: OSMPolyline,
    Map: OSMMap,
    ControlPosition: { RIGHT_TOP: "topright" },
    MapTypeId: { ROADMAP: "roadmap" },
    geometry: { spherical: { computeDistanceBetween: computeDistanceBetween, computeHeading: computeHeading } },
    event: {
        addListener: function(target, eventName, handler) {
            target.on(eventName, function(event) {
                handler({
                    latLng: event.latlng ? new OSMLatLng(event.latlng.lat, event.latlng.lng) : null
                });
            });
        },
        addDomListener: function(target, eventName, handler) { target.addEventListener(eventName, handler); }
    }
} };
function slepk() {
    if (document.getElementById("bar").style.display == 'none') {
        document.getElementById("bar").style.display = 'inline';
        document.getElementById("closer").style.backgroundPosition = '4px 6px';
    } else {
        document.getElementById("bar").style.display = 'none';
        document.getElementById("closer").style.backgroundPosition = '4px -8px';
    }
    document.getElementById("loc").focus();
}
Number.prototype.toRad = function() {
    return this * Math.PI / 180;
};
Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
};

function point_it(event, what) {
    var onePix = nDistM / 770;
    var posPix = event.offsetX ? (event.offsetX) : event.pageX - document.getElementById("bar2").offsetLeft;
    if (posPix < 30) {
        posPix = 30;
    }
    document.getElementById("bar2over").style.left = posPix + "px";
    var mtrPix = onePix * (posPix - 30);
    var lat1 = start.lat().toRad();
    var lon1 = start.lng().toRad();
    var lat2 = nowPoint.lat().toRad();
    var lon2 = nowPoint.lng().toRad();
    var dLon = (nowPoint.lng() - start.lng()).toRad();
    var brng = Math.atan2(Math.sin(dLon) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon));
    var angDist = mtrPix / 6371000;
    lat2 = Math.asin(Math.sin(lat1) * Math.cos(angDist) + Math.cos(lat1) * Math.sin(angDist) * Math.cos(brng));
    lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(angDist) * Math.cos(lat1), Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2));
    var myLatlng = new osm.maps.LatLng(lat2.toDeg(), lon2.toDeg());
    document.getElementById("bar2over").style.display = 'inline';
    if (markerDist) {
        markerDist.setPosition(myLatlng);
    } else {
        var icon = new osm.maps.MarkerImage("auksc.png", null, null, new osm.maps.Point(4, 3), new osm.maps.Size(7, 7));
        markerDist = new osm.maps.Marker({
            position: myLatlng,
            map: map,
            icon: icon
        });
    }
}

function centruok() {
    map.setZoom(15);
    map.setCenter(markerDist.position);
}

function setCookie(name, value, expires, path, domain, secure) {
    var today = new Date();
    today.setTime(today.getTime());
    if (expires) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expiresDate = new Date(today.getTime() + (expires));
    document.cookie = name + "=" + escape(value) + ((expires) ? ";expires=" + expiresDate.toGMTString() : "") + ((path) ? ";path=" + path : "") + ((domain) ? ";domain=" + domain : "");
    var pointas = value.split("/");
    pointas = new osm.maps.LatLng(pointas[1], pointas[0]);
    rodyk(null, pointas);
}

function getCookie(checkName) {
    var aAllCookies = document.cookie.split(';');
    var aTempCookie = '';
    var cookieName = '';
    var cookieValue = '';
    var bCookieFound = false;
    for (i = 0; i < aAllCookies.length; i++) {
        aTempCookie = aAllCookies[i].split('=');
        cookieName = aTempCookie[0].replace(/^\s+|\s+$/g, '');
        if (cookieName == checkName) {
            bCookieFound = true;
            if (aTempCookie.length > 1) {
                cookieValue = unescape(aTempCookie[1].replace(/^\s+|\s+$/g, ''));
            }
            return cookieValue;
            break;
        }
        aTempCookie = null;
        cookieName = '';
    }
    if (!bCookieFound) {
        return null;
    }
}

function rodyk(overlay, point) {
    if (point) {
        nowPoint = point;
        var markers = [];
        var yra = 0;
        var longDir;
        if (point.lng() < 0) {
            longDir = "W";
        } else {
            longDir = "E";
        }
        var latDir;
        if (point.lat() < 0) {
            latDir = "S";
        } else {
            latDir = "N";
        }
        var longDeg;
        var longMin;
        if (point.lng() > 0) {
            longDeg = Math.floor(point.lng());
            longMin = (point.lng() - longDeg) * 100;
        } else {
            longDeg = Math.ceil(point.lng());
            longMin = (longDeg - point.lng()) * 100;
        }
        var longMin2 = longMin * 60 / 100;
        var longSec = Math.round((longMin2 - Math.floor(longMin2)) * 60);
        var latDeg;
        var latMin;
        if (point.lat() > 0) {
            latDeg = Math.floor(point.lat());
            latMin = (point.lat() - latDeg) * 100;
        } else {
            latDeg = Math.ceil(point.lat());
            latMin = (latDeg - point.lat()) * 100;
        }
        var latMin2 = latMin * 60 / 100;
        var latSec = Math.round((latMin2 - Math.floor(latMin2)) * 60);
        var tmplng = Math.round(point.lng() * 100000) / 100000;
        var tmplat = Math.round(point.lat() * 100000) / 100000;
        var strHtml = "<p><b>Koordinatės laipsniais:</b><br/>" + tmplat + " " + latDir;
        strHtml += ", " + tmplng + " " + longDir;
        strHtml += "</p>\n";
        strHtml += "<p><b>Koordinatės sekundėm:</b><br/>";
        strHtml += latDeg + "&deg; " + Math.floor(latMin2) + "' " + latSec + "'' " + latDir + ", ";
        strHtml += longDeg + "&deg; " + Math.floor(longMin2) + "' " + longSec + "'' " + longDir;
        strHtml += "</p>\n";
        strHtml += "<p><b>Aukštis virš jūros lygio:</b><br/><span id='elevatorius'></span></p>\n";
        var ychr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var ynum = "0123456789";
        var yqth, yi, yk, ydiv, yres, ylp, y;
        var y = 0;
        var ycalc = new Array(0, 0, 0);
        var yn = new Array(0, 0, 0, 0, 0, 0, 0);
        ycalc[1] = point.lng() + 180;
        ycalc[2] = point.lat() + 90;
        for (yi = 1; yi < 3; ++yi) {
            for (yk = 1; yk < 4; ++yk) {
                if (yk != 3) {
                    if (yi == 1) {
                        if (yk == 1) {
                            ydiv = 20;
                        }
                        if (yk == 2) {
                            ydiv = 2;
                        }
                    }
                    if (yi == 2) {
                        if (yk == 1) {
                            ydiv = 10;
                        }
                        if (yk == 2) {
                            ydiv = 1;
                        }
                    }
                    yres = ycalc[yi] / ydiv;
                    ycalc[yi] = yres;
                    if (ycalc[yi] > 0) {
                        ylp = Math.floor(yres);
                    } else {
                        ylp = Math.ceil(yres);
                    }
                    ycalc[yi] = (ycalc[yi] - ylp) * ydiv;
                } else {
                    if (yi == 1) {
                        ydiv = 12;
                    } else {
                        ydiv = 24;
                    }
                    yres = ycalc[yi] * ydiv;
                    ycalc[yi] = yres;
                    if (ycalc[yi] > 0) {
                        ylp = Math.floor(yres);
                    } else {
                        ylp = Math.ceil(yres);
                    }
                }++y;
                yn[y] = ylp;
            }
        }
        if (overlay == 4) {
            yqth = ychr.charAt(yn[1]) + ychr.charAt(yn[4]) + ynum.charAt(yn[2]) + ynum.charAt(yn[5]);
        } else {
            yqth = ychr.charAt(yn[1]) + ychr.charAt(yn[4]) + ynum.charAt(yn[2]) + ynum.charAt(yn[5]) + ychr.charAt(yn[3]) + ychr.charAt(yn[6]);
        }
        var raide = ychr.charAt(Math.floor(((point.lat() - 56.5) * -1) / 0.1666666667));
        var skaicius = Math.floor((point.lng() - 20.8333333333) / 0.1666666667);
        if (skaicius < 10) {
            var kvadratas = raide + '0' + skaicius;
        } else {
            var kvadratas = raide + skaicius;
        }
        for (var i = 0; i < kvadratai.length; i++) {
            if (kvadratai[i] == kvadratas) {
                yra = 1;
            }
        }
        strHtml += "<p><b>WWL lokatorius:</b><img src='line_wwl.gif' alt='' /><br/><span class='loc'>" + yqth;
        strHtml += "</span></p>\n";
        if (yra == 1 && overlay != 4) {
            strHtml += "<p><b>WAL lokatorius:</b><img src='line_wal.gif' alt='' /><br/><span class='loc'>" + kvadratas;
            strHtml += "</span></p>\n";
        } /* strHtml += "<p style='padding-top: 10px; margin-top: 5px; border-top: 1px solid black'>"; strHtml += "WWL: <input type='checkbox' id='chWWL' style='padding:0; margin:0;' checked='checked'> &nbsp;"; strHtml += "WAL: <input type='checkbox' id='chWAL' style='padding:0; margin:0;' checked='checked'> &nbsp; "; strHtml += "Aukščiai: <input type='checkbox' id='chALT' style='padding:0; margin:0;' checked='checked'></p>"; */
        var strHtml2 = '';
        if (markerhome) {
            markerhome.setMap(null);
            markerhome.length = 0;
        }
        if (geodesic) {
            geodesic.setMap(null);
            geodesic.length = 0;
        }
        if (strCookie = getCookie("home")) {
            strHtml2 += "<p><b>Atstumas nuo namų taško:</b><br/>";
            var aStart = strCookie.split("/");
            start = new osm.maps.LatLng(aStart[1], aStart[0]);
            markerhome = new osm.maps.Marker({
                position: start,
                map: map,
                icon: 'line_namai.png'
            });
            var polylineClickp = [point, start];
            geodesic = new osm.maps.Polyline({
                path: polylineClickp,
                strokeColor: '#0000FF',
                strokeOpacity: 0.4,
                strokeWeight: 3,
                geodesic: true
            });
            geodesic.setMap(map);
            nDistM = osm.maps.geometry.spherical.computeDistanceBetween(point, start);
            if (nDistM >= 10000) {
                var nDistKm = Math.round(nDistM / 1000);
                strHtml2 += Math.ceil(nDistM / 1000) + "km";
            } else if (nDistM >= 1000) {
                strHtml2 += Math.ceil(nDistM / 100) / 10 + "km";
            } else {
                strHtml2 += Math.round(nDistM) + "m";
            }
            if (aStart[1] != point.lat() && aStart[0] != point.lng() && document.getElementById('chALT').checked) {
                strHtmlBar2 = "http://www.heywhatsthat.com/bin/profile.cgi?src=main&pt0=" + aStart[1] + "," + aStart[0] + ",ff&pt1=" + point.lat() + "," + point.lng() + "&curvature=0&axes=1&metric=1";
                document.getElementById('bar2').style.display = 'block';
                document.getElementById('bar2iner').style.backgroundImage = 'url(\'' + strHtmlBar2 + '\')';
            } else {
                document.getElementById('bar2').style.display = 'none';
            }
            var headas = osm.maps.geometry.spherical.computeHeading(start, point);
            if (headas < 0) headas = headas + 360;
            strHtml2 += "<p><b>Azimutas nuo namų taško:</b><br/>";
            strHtml2 += Math.round(headas);
            strHtml2 += "&deg;";
        }
        strHtml2 += "</p>\n";
        strHtml2 += "<p><a href='#' onClick='setCookie(\"home\", \"" + point.lng() + "/" + point.lat() + "\", 365 * 10);return false;'>Nustatyti šią vietą namų tašku</a></p>\n";
        if (strCookie = getCookie("home")) {
            strHtml2 += "<p><a href='#' onClick='setCookie(\"home\", \"" + point.lng() + "/" + point.lat() + "\", -1 * 365 * 10);return false;'>Ištrinti namų tašką</a></p>\n";
        }
        document.getElementById('barin').style.display = 'block';
        document.getElementById('barin').innerHTML = strHtml;
        document.getElementById('bariner').style.display = 'block';
        document.getElementById('bariner').innerHTML = strHtml2;
        if (marker2) {
            marker2.setMap(null);
            marker2.length = 0;
        }
        if (markerDist) {
            markerDist.setMap(null);
            markerDist.length = 0;
            markerDist = 0;
            document.getElementById("bar2over").style.display = 'none';
        }
        if (polylineClick0) {
            polylineClick0.setMap(null);
            polylineClick0.length = 0;
        }
        if (polylineClick) {
            polylineClick.setMap(null);
            polylineClick.length = 0;
        }
        if (polylineClick2) {
            polylineClick2.setMap(null);
            polylineClick2.length = 0;
        }
        if (overlay != 3) {
            marker2 = new osm.maps.Marker({
                position: point,
                map: map
            });
        }
        if (overlay == 4) {
            var polylineClick0p = [new osm.maps.LatLng(point.lat() - 0.5, point.lng() - 1), new osm.maps.LatLng(point.lat() - 0.5, point.lng() + 1), new osm.maps.LatLng(point.lat() + 0.5, point.lng() + 1), new osm.maps.LatLng(point.lat() + 0.5, point.lng() - 1), new osm.maps.LatLng(point.lat() - 0.5, point.lng() - 1)];
            polylineClick0 = new osm.maps.Polyline({
                path: polylineClick0p,
                strokeColor: "#FF0000",
                strokeOpacity: .4,
                strokeWeight: 6
            });
            if (document.getElementById('chWWL').checked) polylineClick0.setMap(map);
        } else {
            var bottomLeftLong = Math.floor(point.lng() / 0.0833333333) * 0.0833333333;
            var bottomLeftLat = Math.floor(point.lat() / 0.0416666666) * 0.0416666666;
            var polylineClickp = [new osm.maps.LatLng(bottomLeftLat, bottomLeftLong), new osm.maps.LatLng(bottomLeftLat, bottomLeftLong + 0.0833333333), new osm.maps.LatLng(bottomLeftLat + 0.0416666666, bottomLeftLong + 0.0833333333), new osm.maps.LatLng(bottomLeftLat + 0.0416666666, bottomLeftLong), new osm.maps.LatLng(bottomLeftLat, bottomLeftLong)];
            polylineClick = new osm.maps.Polyline({
                path: polylineClickp,
                strokeColor: "#FF0000",
                strokeOpacity: .4,
                strokeWeight: 6
            });
            if (overlay != 3)
                if (document.getElementById('chWWL').checked) polylineClick.setMap(map);
            var bottomLeftLong2 = Math.floor(point.lng() / 0.1666666667) * 0.1666666667;
            var bottomLeftLat2 = Math.floor(point.lat() / 0.1666666667) * 0.1666666667;
            var polylineClick2p = [new osm.maps.LatLng(bottomLeftLat2, bottomLeftLong2), new osm.maps.LatLng(bottomLeftLat2, bottomLeftLong2 + 0.1666666667), new osm.maps.LatLng(bottomLeftLat2 + 0.1666666667, bottomLeftLong2 + 0.1666666667), new osm.maps.LatLng(bottomLeftLat2 + 0.1666666667, bottomLeftLong2), new osm.maps.LatLng(bottomLeftLat2, bottomLeftLong2)];
            polylineClick2 = new osm.maps.Polyline({
                path: polylineClick2p,
                strokeColor: "#00FF00",
                strokeOpacity: .4,
                strokeWeight: 6
            });
            if (overlay != 3)
                if (yra == 1)
                    if (document.getElementById('chWAL').checked) polylineClick2.setMap(map);
        }
    }
    getElevation(point);
}
var kvadratai = new Array('A05', 'A06', 'A07', 'A08', 'A09', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A22', 'A23', 'A24', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24', 'B25', 'B26', 'C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26', 'C27', 'C28', 'C29', 'C30', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20', 'D21', 'D22', 'D23', 'D24', 'D25', 'D26', 'D27', 'D28', 'D29', 'D30', 'D31', 'D32', 'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'E18', 'E19', 'E20', 'E21', 'E22', 'E23', 'E24', 'E25', 'E26', 'E27', 'E28', 'E29', 'E30', 'E31', 'E32', 'E33', 'E34', 'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24', 'F25', 'F26', 'F27', 'F28', 'F29', 'F30', 'F31', 'F32', 'F33', 'F34', 'G00', 'G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08', 'G09', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17', 'G18', 'G19', 'G20', 'G21', 'G22', 'G23', 'G24', 'G25', 'G26', 'G27', 'G28', 'G29', 'G30', 'G31', 'G32', 'G33', 'G34', 'G35', 'H00', 'H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08', 'H09', 'H10', 'H11', 'H12', 'H13', 'H14', 'H15', 'H16', 'H17', 'H18', 'H19', 'H20', 'H21', 'H22', 'H23', 'H24', 'H25', 'H26', 'H27', 'H28', 'H29', 'H30', 'H31', 'H32', 'H33', 'H34', 'H35', 'H36', 'I05', 'I06', 'I07', 'I08', 'I09', 'I10', 'I11', 'I12', 'I13', 'I14', 'I15', 'I16', 'I17', 'I18', 'I19', 'I20', 'I21', 'I22', 'I23', 'I24', 'I25', 'I26', 'I27', 'I28', 'I29', 'I30', 'I31', 'I32', 'I33', 'I34', 'I35', 'J10', 'J11', 'J12', 'J13', 'J14', 'J15', 'J16', 'J17', 'J18', 'J19', 'J20', 'J21', 'J22', 'J23', 'J24', 'J25', 'J26', 'J27', 'J28', 'J29', 'J30', 'J31', 'J32', 'K11', 'K12', 'K13', 'K14', 'K15', 'K16', 'K17', 'K18', 'K19', 'K20', 'K21', 'K22', 'K23', 'K24', 'K25', 'K26', 'K27', 'K28', 'K29', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'L21', 'L22', 'L23', 'L24', 'L25', 'L26', 'L27', 'L28', 'L29', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26', 'M27', 'M28', 'N13', 'N14', 'N15', 'N16', 'N17', 'N18', 'N19', 'N20', 'N21', 'N22', 'N23', 'N24', 'N25', 'N26', 'N27', 'N28', 'N29', 'O15', 'O16', 'O17', 'O18', 'O19', 'O20', 'O21', 'O22', 'O23', 'O24', 'O25', 'O28', 'O29', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20', 'P21', 'P22', 'P23');
var polylineClick0;
var polylineClick;
var polylineClick2;
var marker2, nDistM, start, nowPoint;
var markerDist;
var markerhome;
var map;
var geodesic;
var strCookie;

function initialize() {
    var myLatlng = new osm.maps.LatLng(55.221874, 23.856564);
    var myOptions = {
        zoom: 7,
        center: myLatlng,
        panControl: false,
        scaleControl: false,
        streetViewControl: false,
        zoomControlOptions: {
            position: osm.maps.ControlPosition.RIGHT_TOP
        },
        mapTypeId: osm.maps.MapTypeId.ROADMAP
    };
    map = new osm.maps.Map(document.getElementById("map_canvas"), myOptions);
    osm.maps.event.addListener(map, 'click', function(event) {
        rodyk('', event.latLng);
    });

    if (strCookie = getCookie("home")) {
        var aStart = strCookie.split("/");
        start = new osm.maps.LatLng(aStart[1], aStart[0]);
        rodyk(3, start);
    }(function() {
        var urlHalves = String(document.location).split('?');
        if (urlHalves[1]) {
            var urlVarPair = urlHalves[1].split('=');
            if (urlVarPair[1]) {
                document.getElementById('loc').value = urlVarPair[1].toUpperCase();
                convi();
            } else {
                var urltmp = urlHalves[1].replace("%20", "");
                urltmp = urltmp.split(',');
                if (urltmp[1]) {
                    var urltmpstart = new osm.maps.LatLng(urltmp[0], urltmp[1]);
                    rodyk('', urltmpstart)
                } else {
                    document.getElementById('loc').value = urlVarPair[0].toUpperCase();
                    convi();
                }
            }
        }
    })();
}

function getElevation(point) {
    document.getElementById('elevatorius').innerHTML = 'skaičiuojama...';

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var elevationObjetct = JSON.parse(this.responseText);
            document.getElementById('elevatorius').innerHTML = Math.round(elevationObjetct.elevation[0]) + ' m';
        }
    };
    xhttp.open("GET", "https://api.open-meteo.com/v1/elevation?latitude="+ point.lat() +"&longitude="+ point.lng(), true);
    xhttp.send();
}

function convi() {
    var kvadratas = document.getElementById('loc').value;
    var locator = kvadratas.toUpperCase();
    var locx = locator;
    var loca = new Array();
    if (locator.length == 4) {
        locator = locator + "MM00AA";
    } else if (locator.length == 6) {
        locator = locator + "55AA";
    }
    var yra = 0;
    for (var i = 0; i < kvadratai.length; i++) {
        if (kvadratai[i] == locator) {
            yra = 1;
        }
    }
    var walRegExp = /[A-R]{1}[0-9]{2}/;
    var wwlRegExp = /[A-R]{2}[0-9]{2}[A-X]{2}[0-9]{2}[A-X]{2}/;
    if (locator.length == 10 && wwlRegExp.test(locator)) {
        var i = 0;
        while (i < 10) {
            loca[i] = locator.charCodeAt(i) - 65;
            i++;
        }
        loca[2] += 17;
        loca[3] += 17;
        loca[6] += 17;
        loca[7] += 17;
        point_x = (loca[0] * 20 + loca[2] * 2 + loca[4] / 12 + loca[6] / 120 + loca[8] / 2880 - 180);
        point_y = (loca[1] * 10 + loca[3] + loca[5] / 24 + loca[7] / 240 + loca[9] / 5760 - 90);
    } else if (locator.length == 3 && walRegExp.test(locator) && yra == 1) {
        var i = 0;
        while (i < 3) {
            loca[i] = locator.charCodeAt(i) - 65;
            i++;
        }
        loca[1] += 17;
        loca[2] += 17;
        point_x = (((loca[1] * 10) + loca[2]) * 0.1666666667) + 20.916666666668;
        point_y = ((loca[0] * 0.1666666667) - 56.41666666665) * -1;
    } else {
        alert("Toks kvadratas neegzistuoja");
        return false;
    }
    var point = new osm.maps.LatLng(point_y, point_x);
    if (kvadratas.length == 4) {
        map.setCenter(point);
        map.setZoom(6);
        rodyk(4, point);
    } else {
        map.setCenter(point);
        map.setZoom(10);
        rodyk(null, point);
    }
    return false;
}
osm.maps.event.addDomListener(window, 'load', initialize);
osm.maps.event.addDomListener(window, 'load', function() {
    document.getElementById("closer").onclick = function() { slepk(); };
    document.getElementById("locform").onsubmit = function() { return convi(); };
    document.getElementById("chALT").onclick = function() { document.getElementById('bar2').style.display = 'none'; };
    document.getElementById("bar2iner").onmousemove = function(event) { point_it(event, 1); };
    document.getElementById("bar2over").onclick = function() { centruok(); };
});
