
import { useCallback } from 'react';
import { EnhancedDrumSynthesizer } from '../utils/audio/drumSynthesizer';

export const useDrumSoundMapping = () => {
  const mapDrumSound = useCallback(async (synthesizer: EnhancedDrumSynthesizer, pad: any) => {
    const drumName = pad.name.toLowerCase();
    const drumId = pad.id.toLowerCase(); 
    
    // Kick variants
    if (drumId.includes('kick') || drumName.includes('kick') || drumId === '808' || drumName.includes('808')) {
      await synthesizer.synthesizeKick();
    }
    // Snare variants  
    else if (drumId.includes('snare') || drumName.includes('snare') || drumId.includes('rimshot') || drumName.includes('rimshot')) {
      await synthesizer.synthesizeSnare();
    }
    // Hi-hat variants
    else if (drumId.includes('hihat') || drumName.includes('hi-hat') || drumName.includes('hat')) {
      const isOpen = drumId.includes('open') || drumName.includes('open');
      await synthesizer.synthesizeHiHat(isOpen);
    }
    // Tom variants
    else if (drumId.includes('tom') || drumName.includes('tom')) {
      let pitch: 'high' | 'mid' | 'low' = 'mid';
      if (drumId.includes('high') || drumName.includes('high')) pitch = 'high';
      else if (drumId.includes('low') || drumName.includes('low')) pitch = 'low';
      await synthesizer.synthesizeTom(pitch);
    }
    // Cymbal variants
    else if (drumId.includes('crash') || drumName.includes('crash') || drumId.includes('china') || drumName.includes('china')) {
      await synthesizer.synthesizeCrash();
    }
    else if (drumId.includes('ride') || drumName.includes('ride')) {
      await synthesizer.synthesizeRide();
    }
    // Clap and percussion
    else if (drumId.includes('clap') || drumName.includes('clap')) {
      await synthesizer.synthesizeClap();
    }
    // Metallic percussion
    else if (drumId.includes('cowbell') || drumName.includes('cowbell') || drumId.includes('agogo') || drumName.includes('agogo')) {
      await synthesizer.synthesizeCowbell();
    }
    // Shakers and rattles
    else if (drumId.includes('shaker') || drumName.includes('shaker') || drumId.includes('shekere') || drumName.includes('shekere')) {
      await synthesizer.synthesizeShaker();
    }
    // Rim shots
    else if (drumId.includes('rim') || drumName.includes('rim')) {
      await synthesizer.synthesizeRimshot();
    }
    // African drums
    else if (drumId.includes('djembe') || drumName.includes('djembe')) {
      if (drumName.includes('bass')) {
        await synthesizer.synthesizeDjembeBass();
      } else if (drumName.includes('slap')) {
        await synthesizer.synthesizeDjembeSlap();
      } else {
        await synthesizer.synthesizeDjembeTone();
      }
    }
    else if (drumId.includes('talking') || drumName.includes('talking') || drumId.includes('dundun') || drumName.includes('dun dun')) {
      await synthesizer.synthesizeTalkingDrum();
    }
    else if (drumId.includes('udu') || drumName.includes('udu')) {
      await synthesizer.synthesizeUdu();
    }
    // Melodic percussion
    else if (drumId.includes('kalimba') || drumName.includes('kalimba') || drumId.includes('bells') || drumName.includes('bells')) {
      await synthesizer.synthesizeBells();
    }
    // Brush sounds
    else if (drumName.includes('brush')) {
      if (drumName.includes('swirl')) {
        await synthesizer.synthesizeBrushSwirl();
      } else {
        await synthesizer.synthesizeBrushTap();
      }
    }
    // Effects and vocals
    else if (drumId.includes('fx') || drumName.includes('fx') || drumId.includes('vocal') || drumName.includes('vocal')) {
      await synthesizer.synthesizeFX();
    }
    // General percussion fallback
    else if (drumId.includes('perc') || drumName.includes('percussion')) {
      await synthesizer.synthesizePercussion();
    }
    // Default fallback to kick
    else {
      await synthesizer.synthesizeKick();
    }
  }, []);

  return { mapDrumSound };
};
