/**
 * Track module - Handles track creation and rendering
 */
import Config from './config.js';

export default class Track {
    constructor(scene) {
        this.scene = scene;
        this.trackObjects = new THREE.Group();
        this.trackPath = null;
        
        this.createTrackPath();
        this.drawTrack();
        
        scene.add(this.trackObjects);
    }
    
    createTrackPath() {
        const points = Config.trackPath.map(point => 
            new THREE.Vector3(point.x, point.y, point.z)
        );
        
        this.trackPath = new THREE.CatmullRomCurve3(points);
        this.trackPath.closed = true;
    }
    
    drawTrack() {
        const points = this.trackPath.getPoints(400);
        const railMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x505050, 
            roughness: 0.6, 
            metalness: 0.5 
        });
        
        const sleeperMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x6D4C41, 
            roughness: 0.85 
        });
        
        const ballastMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x888888, 
            roughness: 0.9, 
            map: this.createBallastTexture() 
        });

        const { railWidth, railHeight, railOffset, sleeperWidth, sleeperHeight, 
               sleeperDepth, ballastWidth, ballastHeight } = Config.track;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const segmentLength = p1.distanceTo(p2);

            if (segmentLength < 0.01) continue;

            const tangentVec = p2.clone().sub(p1);
            if (tangentVec.lengthSq() < 0.00001) continue;
            const tangent = tangentVec.normalize();

            const normal = new THREE.Vector3(0, 1, 0);
            const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

            // Ballast (track bed)
            if (i % 2 === 0) {
                const ballastGeo = new THREE.BoxGeometry(ballastWidth, ballastHeight, segmentLength + 0.1);
                const ballast = new THREE.Mesh(ballastGeo, ballastMaterial);
                ballast.position.copy(p1).add(tangent.clone().multiplyScalar(segmentLength / 2));
                ballast.position.y -= ballastHeight / 2;
                ballast.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), tangent);
                ballast.receiveShadow = true;
                this.trackObjects.add(ballast);
            }

            // Rails
            const railGeo = new THREE.BoxGeometry(railWidth, railHeight, segmentLength + 0.01);
            const railL = new THREE.Mesh(railGeo, railMaterial);
            const railR = new THREE.Mesh(railGeo, railMaterial);

            const midPoint = p1.clone().add(tangent.clone().multiplyScalar(segmentLength / 2));

            railL.position.copy(midPoint).add(binormal.clone().multiplyScalar(railOffset));
            railL.position.y += railHeight/2;
            railL.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), tangent);
            railL.castShadow = true;
            this.trackObjects.add(railL);

            railR.position.copy(midPoint).add(binormal.clone().multiplyScalar(-railOffset));
            railR.position.y += railHeight/2;
            railR.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), tangent);
            railR.castShadow = true;
            this.trackObjects.add(railR);

            // Sleepers (ties)
            if (i % 5 === 0) {
                const sleeperGeo = new THREE.BoxGeometry(sleeperWidth, sleeperHeight, sleeperDepth);
                const sleeper = new THREE.Mesh(sleeperGeo, sleeperMaterial);
                sleeper.position.copy(p1);
                
                // Align sleeper perpendicular to track
                const sleeperLookAt = p1.clone().add(binormal);
                sleeper.lookAt(sleeperLookAt);
                sleeper.rotateOnAxis(new THREE.Vector3(0,1,0), Math.atan2(tangent.x, tangent.z));
                
                sleeper.castShadow = true;
                this.trackObjects.add(sleeper);
            }
        }
    }
    
    createBallastTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#909090';
        context.fillRect(0, 0, 64, 64);
        
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 64;
            const y = Math.random() * 64;
            const size = Math.random() * 2 + 1;
            const shade = Math.floor(Math.random() * 50 + 150);
            
            context.fillStyle = `rgb(${shade},${shade},${shade})`;
            context.fillRect(x, y, size, size);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 5);
        
        return texture;
    }
    
    getPath() {
        return this.trackPath;
    }
} 