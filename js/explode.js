// The code have been taken from the following website to create explosion and updated as per the requirements:
// https://codepen.io/Causto/pen/KMzvQe
var movementSpeed = 80;
var totalObjects = 100;
var objectSize = 5;
var explosionColor = 0x996600;
/////////////////////////////////
var dirs = [];
var parts = [];

function ExplodeAnimation(scene, x, y) {
    var geometry = new THREE.Geometry();

    for (i = 0; i < totalObjects; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = x;
        vertex.y = y;
        vertex.z = 0;

        geometry.vertices.push(vertex);
        dirs.push({
            x: (Math.random() * movementSpeed) - (movementSpeed / 2),
            y: (Math.random() * movementSpeed) - (movementSpeed / 2),
            z: (Math.random() * movementSpeed) - (movementSpeed / 2)
        });
    }
    var material = new THREE.ParticleBasicMaterial({ size: objectSize, color: explosionColor });
    var particles = new THREE.ParticleSystem(geometry, material);

    this.object = particles;
    this.status = true;

    scene.add(this.object);

    this.update = function() {
        if (this.status == true) {
            var pCount = totalObjects;
            while (pCount--) {

                var particle = this.object.geometry.vertices[pCount];

                particle.y += dirs[pCount].y;
                particle.x += dirs[pCount].x;
                particle.z += dirs[pCount].z;
            }
            this.object.geometry.verticesNeedUpdate = true;
        }
    }

}