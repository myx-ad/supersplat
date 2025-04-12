import { Mat4, Quat, Vec3 } from "playcanvas";
import { Scene, SceneConfig } from "../scene";
import { Splat } from "src/splat"
import { myxConfig } from "./myx-config";

const applyZUp = (splat: Splat) => {
    const mat = new Mat4();
    const quat = new Quat();

    const p = splat.entity.getPosition();
    const rq = new Quat().setFromEulerAngles(-90, 0, 0);
    // const rq = new Quat().setFromEulerAngles(0, 0, 0);
    
    mat.setTRS(new Vec3(p.x, p.y, p.z), rq, new Vec3(1, 1, 1));
    quat.setFromMat4(mat);

    const t = mat.getTranslation();
    const r = quat;
    const s = mat.getScale();

    splat.move(t, r, s);
}

const addSplatToScene = ( scene: Scene, splat: Splat ) => {
    scene.add(splat);

    if (myxConfig.zUp) {
        applyZUp(splat);
    }
}

/**
 * Computes the rotation matrix that aligns a given 3D vector `v` to the y-axis [0, 1, 0].
 * @param v - The source vector to be aligned.
 * @returns A 3x3 rotation matrix.
 */
function calculateRotationMatrixToY(v: [number, number, number]): number[][] {
    const u: [number, number, number] = [0, 1, 0];  // Target y-axis

    // Compute the cross product of v and u
    const crossProduct = (a: [number, number, number], b: [number, number, number]): [number, number, number] => {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    };

    // Compute the dot product of v and u
    const dotProduct = (a: [number, number, number], b: [number, number, number]): number => {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };

    // Compute the norm (magnitude) of a vector
    const norm = (a: [number, number, number]): number => {
        return Math.sqrt(dotProduct(a, a));
    };

    // Normalize a vector
    const normalize = (a: [number, number, number]): [number, number, number] => {
        const n = norm(a);
        return n === 0 ? [0, 0, 0] : [a[0] / n, a[1] / n, a[2] / n];
    };

    // Compute the skew-symmetric matrix of a vector
    const skewSymmetricMatrix = (a: [number, number, number]): number[][] => {
        return [
            [0, -a[2], a[1]],
            [a[2], 0, -a[0]],
            [-a[1], a[0], 0]
        ];
    };

    // Matrix addition
    const addMatrices = (A: number[][], B: number[][]): number[][] => {
        return A.map((row, i) => row.map((val, j) => val + B[i][j]));
    };

    // Scalar-matrix multiplication
    const scalarMultiplyMatrix = (scalar: number, A: number[][]): number[][] => {
        return A.map(row => row.map(val => scalar * val));
    };

    // Matrix multiplication (3x3 matrices)
    const multiplyMatrices = (A: number[][], B: number[][]): number[][] => {
        const result: number[][] = [];
        for (let i = 0; i < 3; i++) {
            result[i] = [];
            for (let j = 0; j < 3; j++) {
                result[i][j] = 0;
                for (let k = 0; k < 3; k++) {
                    result[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return result;
    };

    const axis = crossProduct(v, u);
    const cosTheta = dotProduct(v, u) / norm(v);
    const theta = Math.acos(cosTheta);

    if (norm(axis) === 0) {
        if (cosTheta > 0) {
            return [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ];  // Identity matrix
        } else {
            return [
                [-1, 0, 0],
                [0, 1, 0],
                [0, 0, -1]
            ];  // 180-degree rotation around the y-axis
        }
    }

    const axisNormalized = normalize(axis);
    const K = skewSymmetricMatrix(axisNormalized);
    const I = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
    const K2 = multiplyMatrices(K, K);

    // Compute the rotation matrix using Rodrigues' formula: R = I + sin(theta) * K + (1 - cos(theta)) * K^2
    let rotationMatrix = addMatrices(
        addMatrices(
            I,
            scalarMultiplyMatrix(Math.sin(theta), K)
        ),
        scalarMultiplyMatrix(1 - Math.cos(theta), K2)
    );

    return rotationMatrix;
}

/**
 * Applies a 3x3 rotation matrix to a 3D vector.
 * @param rotationMatrix - The 3x3 rotation matrix.
 * @param vector - The 3D vector to be rotated.
 * @returns The rotated 3D vector.
 * @throws Will throw an error if the rotation matrix is not 3x3 or the vector does not have 3 elements.
 */
function applyRotationMatrix(
    rotationMatrix: number[][],
    vector: [number, number, number]
): [number, number, number] {
    // Validate the rotation matrix dimensions
    if (
        rotationMatrix.length !== 3 ||
        rotationMatrix.some(row => row.length !== 3)
    ) {
        throw new Error('Rotation matrix must be 3x3.');
    }

    // Validate the vector dimensions
    if (vector.length !== 3) {
        throw new Error('Input vector must have 3 elements.');
    }

    // Perform matrix-vector multiplication
    const result: [number, number, number] = [
        rotationMatrix[0][0] * vector[0] +
            rotationMatrix[0][1] * vector[1] +
            rotationMatrix[0][2] * vector[2],
        rotationMatrix[1][0] * vector[0] +
            rotationMatrix[1][1] * vector[1] +
            rotationMatrix[1][2] * vector[2],
        rotationMatrix[2][0] * vector[0] +
            rotationMatrix[2][1] * vector[1] +
            rotationMatrix[2][2] * vector[2],
    ];

    return result;
}


 export { addSplatToScene, calculateRotationMatrixToY, applyRotationMatrix }