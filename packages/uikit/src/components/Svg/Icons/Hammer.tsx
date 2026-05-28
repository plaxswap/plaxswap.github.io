import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 24 24" {...props}>
      <path d="M20.7 18.3L13.4 11L15 9.4L16.1 10.5C16.5 10.9 17.1 10.9 17.5 10.5L19.2 8.8C19.6 8.4 19.6 7.8 19.2 7.4L15.6 3.8C14.1 2.3 11.8 2.1 10.1 3.2L9.3 2.4C8.9 2 8.3 2 7.9 2.4L6.5 3.8L9.2 6.5L7.8 7.9L5.1 5.2L3.7 6.6C3.3 7 3.3 7.6 3.7 8L4.5 8.8C3.4 10.5 3.6 12.8 5.1 14.3L6.5 12.9C5.6 12 5.6 10.6 6.5 9.7L10.9 5.3C11.8 4.4 13.2 4.4 14.1 5.3L17.1 8.3L16.8 8.6L15.7 7.5C15.3 7.1 14.7 7.1 14.3 7.5L12 9.8L10.9 8.7L9.5 10.1L19.3 19.9C19.7 20.3 20.3 20.3 20.7 19.9C21.1 19.5 21.1 18.7 20.7 18.3Z" />
    </Svg>
  );
};

export default Icon;
