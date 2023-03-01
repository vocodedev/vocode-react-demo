import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { Box, Center, Icon } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { isSafari } from "react-device-detect";

const MicrophoneIcon = ({
  muted,
  color,
}: {
  muted: boolean;
  color: string;
}) => {
  return (
    <AnimatePresence>
      <svg
        stroke={color || "currentColor"}
        fill={color || "currentColor"}
        strokeWidth="0"
        viewBox="0 0 352 512"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow( 0px 0px 0.75em rgba(256, 256, 256, .5))",
        }}
      >
        {/* <filter id="shadow" color-interpolation-filters="sRGB">
          <feDropShadow
            dx="-60"
            dy="-60"
            stdDeviation="0"
            flood-color="white"
            flood-opacity="1"
          />
        </filter> */}
        <path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z" />
        {/* <g filter="url(#shadow)"> */}
        <motion.path
          visibility={!muted && isSafari ? "hidden" : "visible"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: muted ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          filter="drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));"
          stroke={color || "currentColor"}
          strokeWidth={30}
          d="M10 10l332 492"
        />
        {/* </g> */}
      </svg>
    </AnimatePresence>
  );
};

export default MicrophoneIcon;
