/////////////////////////////////////////////////////////
// AUTHOR: ADITYA BHARDWAJ
// UNITY ID: ABHARDW2
/////////////////////////////////////////////////////////
function ObjectFactory(scene) {
    var textureLoader = new THREE.TextureLoader();
    var preloadMissile = false,
        preloadAntiMissile = false,
        preloadCity = false,
        preloadFarm = false,
        preloadBuilding = false,
        preloadRedBuilding = false;
    var missileBuffer = [],
        ballistic = [],
        audioList = [],
        buildingBuffer = [],
        additionalBuffer = [];
    var plane = [];
    var myPlane;

    this.audioInitialize = function() {
        var audioPath = "../sounds/";
        audioList.push(new Audio(audioPath + "arcade_music_loop.wav"));
        audioList.push(new Audio(audioPath + "Explosion.wav"));
        audioList.push(new Audio(audioPath + "win.wav"));
        audioList.push(new Audio(audioPath + "lose.wav"));
        audioList.push(new Audio(audioPath + "propulsion.wav"));
    };

    this.playAudio = function(audioName) {
        switch (audioName) {
            case "background":
                audioList[0].loop = true;
                audioList[0].volume = 0.5;
                audioList[0].play();
                break;
            case "explode":
                audioList[1].loop = false;
                audioList[1].volume = 0.5;
                audioList[1].play();
                break;
            case "win":
                audioList[2].loop = false;
                audioList[2].volume = 0.5;
                audioList[2].play();
                break;
            case "lose":
                audioList[3].loop = false;
                audioList[3].volume = 0.5;
                audioList[3].play();
                break;
            case "propulsion":
                audioList[4].loop = false;
                audioList[4].volume = 0.5;
                audioList[4].play();
                break;
        }
    }

    this.stopAudio = function(audioName) {
        switch (audioName) {
            case "background":
                audioList[0].pause();
                break;
            case "explode":
                audioList[1].pause();
                break;
            case "win":
                audioList[2].pause();
                break;
            case "lose":
                audioList[3].pause();
                break;
            case "propulsion":
                audioList[4].pause();
                break;
        }
    }

    this.loadGround = function(scene) {
        // load a resource
        textureLoader.load(
            // resource URL
            '../assets/grasslight-big.jpg',
            // Function when resource is loaded
            function(texture) {
                // do something with the texture
                var planeMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });
                plane = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), planeMaterial);
                plane.rotation.x = 90 * (Math.PI / 180);
                plane.position.y = -25;
                plane.name = "plane";
                scene.add(plane);
            },
            // Function called when download progresses
            function(xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // Function called when download errors
            function(xhr) {
                console.log('An error happened');
            }
        );
    }

    this.createCity = function(scene, x1, x2, x3, x4) {
        this.createRedBuilding(scene, 3, x1);
        this.createRedBuilding(scene, 2, x2);
        this.createRedBuilding(scene, 1, x3);
    }

    this.createBatteries = function(scene, x1, x2) {
        this.createLauncher(scene, x1);
        this.createLauncher(scene, x2);
    }
    this.createRedBuilding = function(scene, buildingNumber, x) {
        var buildingName = "building" + buildingNumber + ".stl";

        // model from http://www.thingiverse.com/thing:69709
        var loader = new THREE.STLLoader();
        var group = new THREE.Object3D();
        loader.load("../assets/buildings/" + buildingName,
            function(geometry) {
                var mat = new THREE.MeshLambertMaterial({ color: 0x7777ff });
                group = new THREE.Mesh(geometry, mat);
                group.name = "building";
                group.rotation.x = -0.5 * Math.PI;
                group.position.x = x;
                group.position.y = -20;
                group.position.z = 0;
                group.scale.set(0.4, 1, 0.4);
                buildingBuffer.push(group);
                scene.add(group);
            });
    }

    this.createLauncher = function(scene, x) {
        var buildingName = "building5.stl";

        // model from http://www.thingiverse.com/thing:69709
        var loader = new THREE.STLLoader();
        var group = new THREE.Object3D();
        loader.load("../assets/buildings/" + buildingName,
            function(geometry) {
                var mat = new THREE.MeshLambertMaterial({ color: 0xFF7777 });
                group = new THREE.Mesh(geometry, mat);
                group.name = "building";
                group.rotation.x = -0.5 * Math.PI;
                group.position.x = x;
                group.position.y = -20;
                group.position.z = 0;
                group.scale.set(0.4, 1, 0.4);
                buildingBuffer.push(group);
                scene.add(group);
            });
    }

    this.findPosition = function() {
        var newPosition = Math.random() * 100;
        if (Math.abs(newPosition) >= 50) {
            this.findPosition();
        } else {
            return newPosition;
        }
    }

    this.createCombatMissile = function(scene, x) {
        var missile = "combat_missile.stl";
        // model from http://www.thingiverse.com/thing:69709
        var loader = new THREE.STLLoader();
        var groupMissile = new THREE.Object3D();
        loader.load("../assets/missile/" + missile,
            function(geometry) {
                var mat = new THREE.MeshLambertMaterial({ color: 0xffffff });

                groupMissile = new THREE.Mesh(geometry, mat);
                groupMissile.name = "missile";

                //groupMissile.rotation.y = -0.1 * Math.PI;
                var newYPosition = Math.random() * 100;
                newYPosition = newYPosition > 25 ? newYPosition : 27;
                groupMissile.position.y = newYPosition;
                groupMissile.position.z = 0;
                var newPosition = Math.random() * 100;
                if (newPosition > 0) {
                    groupMissile.rotation.x = -0.5 * Math.PI;
                } else {
                    groupMissile.rotation.x = 0.5 * Math.PI;
                }
                newPosition = newPosition < 50 ? newPosition : newPosition - 100;
                groupMissile.position.x = newPosition;

                groupMissile.scale.set(0.0076, 0.0076, 0.0076);
                missileBuffer.push({ missile: groupMissile, position: newPosition });
            });
    }

    this.createAntiMissile = function(batteryNumber) {
        var missile = "combat_missile.stl";

        // model from http://www.thingiverse.com/thing:69709
        var loader = new THREE.STLLoader();
        var groupAntiMissile = new THREE.Object3D();
        loader.load("../assets/missile/" + missile,
            function(geometry) {
                var mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
                groupAntiMissile = new THREE.Mesh(geometry, mat);
                groupAntiMissile.rotation.x = -0.5 * Math.PI;
                groupAntiMissile.rotation.y = Math.PI;
                if (batteryNumber == 1) {
                    groupAntiMissile.position.x = -20;
                } else {
                    groupAntiMissile.position.x = 10;
                }
                groupAntiMissile.position.y = -10;
                groupAntiMissile.position.z = 0;
                groupAntiMissile.scale.set(0.0076, 0.0076, 0.0076);
                //scene.add(groupAntiMissile);
                ballistic.push(groupAntiMissile);
            });
    }

    this.initAntiBallistic = function(level) {
        var j = 0;
        for (var i = 0; i < level * 11; i++) {
            if (j < level * 5) {
                this.createAntiMissile(1);
            } else {
                this.createAntiMissile(2);
            }
            j++;
        }
    }

    this.antiBallisticGroup = function() {
        return ballistic;
    }
    this.createPlane = function() {
        var missile = "combat_missile.stl";
        // model from http://www.thingiverse.com/thing:69709
        var loader = new THREE.STLLoader();
        var groupMissile = new THREE.Object3D();
        loader.load("../assets/missile/" + missile,
            function(geometry) {
                var mat = new THREE.MeshLambertMaterial({ color: 0xFF4500 });

                groupMissile = new THREE.Mesh(geometry, mat);
                groupMissile.name = "missile";

                //groupMissile.rotation.y = -0.1 * Math.PI;
                var newYPosition = Math.random() * 100;
                newYPosition = newYPosition > 25 ? newYPosition : 27;
                groupMissile.position.y = newYPosition;
                groupMissile.position.z = 0;
                var newPosition = Math.random() * 100;
                if (newPosition > 0) {
                    groupMissile.rotation.x = -0.5 * Math.PI;
                } else {
                    groupMissile.rotation.x = 0.5 * Math.PI;
                }
                newPosition = newPosition < 50 ? newPosition : newPosition - 100;
                groupMissile.position.x = newPosition;

                groupMissile.scale.set(0.03, 0.03, 0.03);
                missileBuffer.push({ missile: groupMissile, position: newPosition });
            });
    }
    this.returnPlane = function() {
        return myPlane;
    }

    this.getBuildings = function() {
        return buildingBuffer;
    }

    this.planeMotion = function(speed) {
        myPlane[0].position.x += speed;
    }
    this.initMissile = function(scene, level) {
        for (var i = 0; i < level * 10; i++) {
            this.createCombatMissile(scene);
        }
    }

    this.missileGroup = function() {
        return missileBuffer;
    }

    this.antiMissileMotion = function(missileGroup) {
        missileGroup.position.y += 0.05;
    }
}