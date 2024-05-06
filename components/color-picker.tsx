'use client';
import { useState } from 'react';
import {ChromePicker} from 'react-color'

export default function ColorPicker() {
const [background, setBackground] = useState("#FFF");


  return (
    <><ChromePicker
        color={background}
        onChange={(e) => setBackground(e.hex)}
    
    /></>
  )
}