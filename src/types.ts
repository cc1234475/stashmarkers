export interface Frame {
    id: string;
    offset: number;
    frame: number;
    time: number;
    tag: Tag;
  }
  
export interface Tag {
    label: string;
    prob: number;
  }