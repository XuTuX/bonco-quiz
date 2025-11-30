import { motion } from "framer-motion";

export default function Background() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-50">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -60, 0],
                    opacity: [0.3, 0.4, 0.3],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 2,
                }}
                className="absolute top-[10%] -right-[10%] w-[60vw] h-[60vw] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 45, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 5,
                }}
                className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            />
        </div>
    );
}
