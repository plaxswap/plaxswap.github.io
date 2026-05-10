/* eslint-disable */
import type React from 'react'

declare namespace JSX {
  interface IntrinsicAttributes extends React.Attributes {}

  interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}

  interface ElementChildrenAttribute {
    children: unknown
  }

  interface IntrinsicElements {
    [elemName: string]: any
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicAttributes extends React.Attributes {}

    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}

    interface ElementChildrenAttribute {
      children: unknown
    }

    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}
