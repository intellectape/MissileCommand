/////////////////////////////////////////////////////////
// AUTHOR: ADITYA BHARDWAJ
// UNITY ID: ABHARDW2
/////////////////////////////////////////////////////////

var example = (function() {

    "use strict";

    var scene = new THREE.Scene(),
        renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer({ alpha: true }) : new THREE.CanvasRenderer(),
        light = new THREE.AmbientLight(0xffffff),
        camera,
        controls,
        aircraft,
        ground,
        mouseMesh,
        factory;
    var score = 0,
        lives = 11;
    var mouse = { x: 0, y: 0 },
        INTERSECTED;
    var antiBallisticBuf = [],
        missileBuffer = [];
    var quota = 10,
        i = 0,
        j = 0,
        level = 1;
    var buildingBuffer = [];
    var target, position;
    var upmissile = -1;
    var explosionUpdates;
    var explodeTrue = false;
    var myte = 0;
    var gameOver = false;
    var id;
    var planeLoaded = true;
    var gameRunning = false;

    // Mouse click Event
    function handleMouseDown(event) {
        if (upmissile < antiBallisticBuf.length - 1) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            upmissile++;
            // Make the sphere follow the mouse
            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            vector.unproject(camera);
            var dir = vector.sub(camera.position).normalize();
            var distance = -camera.position.z / dir.z;
            var pos = camera.position.clone().add(dir.multiplyScalar(distance));

            target = { x: pos.x, y: pos.y };
            position = { x: antiBallisticBuf[upmissile].position.x, y: antiBallisticBuf[upmissile].position.y };
            factory.playAudio("propulsion"); // playing audio on Missile fire
            var tween = new TWEEN.Tween(position).to(target, 200);
            // http://learningthreejs.com/blog/2011/08/17/tweenjs-for-smooth-animation/
            tween.onUpdate(function() {
                antiBallisticBuf[upmissile].position.x = position.x;
                antiBallisticBuf[upmissile].position.y = position.y;
                //if (position.x === target.x) {
                var myMissile = antiBallisticBuf[upmissile];
                if (!checkCollision(myMissile)) {
                    try {
                        if (myMissile.position.y >= target.y || myMissile.position.x >= target.x) {
                            console.log(antiBallisticBuf);
                            console.log(myMissile);
                            scene.remove(myMissile);
                        }
                    } catch (error) {
                        console.log("called");
                    }
                }
                //}
            });
            tween.start();
        }
    }

    // Follows the mouse event
    function onMouseMove(event) {
        // Update the mouse variable
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Make the sphere follow the mouse
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        var dir = vector.sub(camera.position).normalize();
        var distance = -camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        mouseMesh.position.copy(pos);
    };

    var timeInterval = 5;
    // Adding Missiles at any time
    window.setInterval(function() {
        if (i < 11) {
            addMissileScene(i);
        } else {
            myte++;
        }
        if (j < 11) {
            addAntiMissileScene(j);
        } else {
            myte++;
        }
        if (missileBuffer.length != 0) {
            i++;
            gameRunning = true;
        }
        if (antiBallisticBuf.length != 0) {
            j++;
            gameRunning = true;
        }
        //explodeTrue = false;
    }, timeInterval);

    // Adding light to the scene
    function addLight(scene) {
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(100, 100, -100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(120, 1, 1, 1000));
        light.shadow.bias = 0.00001;
        light.shadow.mapSize.width = 2048 * 2;
        light.shadow.mapSize.height = 2048 * 2;
        scene.add(light);

        light = new THREE.DirectionalLight(0xffffff); //0x002288
        light.position.set(-100, 100, -100);
        light.target.position.set(0, 0, 0);
        scene.add(light);

        light = new THREE.AmbientLight(0x222222);
        scene.add(light);
    }

    // Initializing the camera for the scene
    function initCamera(scene) {
        camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        camera.position.z = 100;
        scene.add(camera);
    }

    // Initializing the mouse pointer
    function initializeMousePointer() {
        // Create a circle around the mouse and move it
        // The sphere has opacity 0
        var mouseGeometry = new THREE.SphereGeometry(1, 0, 0);
        var mouseMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00
        });
        mouseMesh = new THREE.Mesh(mouseGeometry, mouseMaterial);
        mouseMesh.position.z = -5;
        scene.add(mouseMesh);
    }

    // Initializing the Scene
    function initScene() {
        factory = new ObjectFactory(scene);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("webgl-container").appendChild(renderer.domElement);
        renderer.setClearColor(0x87cefa, 1);

        // Initializing Camera, Mouse Pointer and adding List to the scene
        addLight(scene);
        initCamera(scene);
        initializeMousePointer();

        // When the mouse moves, call the given function
        document.addEventListener('mousemove', onMouseMove, false);
        // When the move is clicked, call the given function
        document.addEventListener('mousedown', handleMouseDown, false);

        // ground for the game
        factory.loadGround(scene);

        //aircraft = factory.returnPlane();

        // Initializing combat missiles
        factory.initMissile(scene, level);
        factory.createPlane();
        // Fetching Missiles
        missileBuffer = factory.missileGroup();
        //createNewMissileBuffer();

        // Initializing anti combat missiles
        factory.initAntiBallistic(level);
        // Fetching anti combat missiles
        antiBallisticBuf = factory.antiBallisticGroup();

        // Initializing City for the game
        factory.createCity(scene, 20, 25, 30, 35);
        factory.createCity(scene, 0, -5, -10, -15);
        factory.createCity(scene, -35, -40, -45, -50);

        // Initializing Batteris in the scene
        factory.createBatteries(scene, -20, 10);
        buildingBuffer = factory.getBuildings();


        // Initializing audio for the game
        factory.audioInitialize();

        // Playing audio for background music in the game
        factory.playAudio("background");

        // Render loop for the game
        render();
    }

    // Adding Missiles to the scene on call from time interval method
    function addMissileScene(number) {
        scene.add(missileBuffer[number]["missile"]);
    }

    // Adding Anti Ballistic Missiles to the scene on call from time interval method
    function addAntiMissileScene(number) {
        scene.add(antiBallisticBuf[number]);
    }

    // Animating Missile Motion in the scene
    function missileMotion(missileGroup) {

        if (missileGroup.length <= 0 && gameRunning) {
            gameWinCall();
        } else {
            for (var i = 0; i < missileGroup.length; i++) {
                var speed = 0.1;
                missileGroup[i]["missile"].rotation.z += 0.05;
                missileGroup[i]["missile"].position.y -= speed;
                if (missileGroup[i]["missile"].position.y <= -27) {
                    scene.remove(missileGroup[i]["missile"]);
                    missileGroup.splice(i, 1);
                    factory.playAudio("explode");
                    window.setTimeout(function() {
                        factory.stopAudio("explode");
                    }, 1000);
                }
                try {
                    if (missileGroup[i]["position"] > 0 || missileGroup[i]["missile"].position.x >= 52) {
                        missileGroup[i]["missile"].position.x -= speed;
                    } else if (missileGroup[i]["position"] < 0 || missileGroup[i]["missile"].position.x <= -52) {
                        missileGroup[i]["missile"].position.x += speed;
                    }
                } catch (error) {
                    console.log("Missile error");
                }
            }
        }
    }

    // Checking for collision between Anti-Ballistic and combat missiles
    function checkCollision(antiMissile) {
        //console.log("antiMissile call");
        var returnVal = false;
        var newAntiMis = new THREE.Box3().setFromObject(antiMissile);
        for (var l = 0; l < missileBuffer.length; l++) {
            missileBuffer[l].missile.geometry.computeBoundingBox();
            var newMis = new THREE.Box3().setFromObject(missileBuffer[l]["missile"]);
            if (newAntiMis.intersectsBox(newMis)) {
                scene.remove(missileBuffer[l]["missile"]);
                scene.remove(antiMissile);
                missileBuffer.splice(l, 1);
                factory.playAudio("explode");
                explosionUpdates = new ExplodeAnimation(scene, antiMissile.position.x, antiMissile.position.y);
                window.setTimeout(function() {
                    factory.stopAudio("explode");
                }, 1000);
                score += 10;
                document.getElementById("scoreCalc").innerText = score;
                returnVal = true;
                break;
            }
        }
        return returnVal;
    }

    // Checking Missile City Explosion
    function checkMissileCityCollision() {

        if (!gameOver) {
            for (var l = 0; l < missileBuffer.length; l++) {
                missileBuffer[l].missile.geometry.computeBoundingBox();
                var newMis = new THREE.Box3().setFromObject(missileBuffer[l]["missile"]);
                for (var j = 0; j < buildingBuffer.length; j++) {
                    buildingBuffer[j].geometry.computeBoundingBox();
                    var newBuild = new THREE.Box3().setFromObject(buildingBuffer[j]);
                    if (newMis.intersectsBox(newBuild)) {
                        explosionUpdates = new ExplodeAnimation(scene, missileBuffer[l]["missile"].position.x, missileBuffer[l]["missile"].position.y);
                        scene.remove(missileBuffer[l]["missile"]);
                        scene.remove(buildingBuffer[j]);
                        missileBuffer.splice(l, 1);
                        buildingBuffer.splice(j, 1);
                        lives--;
                        document.getElementById("healthCalc").innerText = lives;
                        factory.playAudio("explode");
                        window.setTimeout(function() {
                            factory.stopAudio("explode");
                        }, 1000);
                    }
                    if (lives <= 0) {
                        gameOver = true;
                        gameOverCall();
                    }
                }
            }
        }
    }

    // Calling Game over function if all the missiles have destroyed the cities
    function gameOverCall() {
        factory.stopAudio("background");
        factory.playAudio("lose");
        document.getElementById("gameState").innerText = "GAME OVER!";
        $("#scoreboard").removeClass('hide-score');

        window.setTimeout(function() {
            cancelAnimationFrame(id);
        }, 5000);

    }

    // Calling Game win function if all the attack missile are destroyed
    function gameWinCall() {
        factory.stopAudio("background");
        factory.playAudio("win");
        $("#scoreboard").removeClass('hide-score');
        window.setTimeout(function() {
            window.location.href = '../level2.html';
        }, 5000);
    }

    // Checking for game score and showing the game win if the missiles are destroyed
    function checkGameStatus() {
        if (lives > 0 && missileBuffer.length <= 0 && gameRunning) {
            gameWinCall();
        }
    }

    // Render animation function 
    function render() {
        missileMotion(missileBuffer);
        if (myte > 21) {
            checkMissileCityCollision();
        }
        TWEEN.update();
        checkGameStatus();
        if (explosionUpdates != null) {
            explosionUpdates.update();
        }
        id = requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    window.onload = initScene;

    return {
        scene: scene
    }

})();