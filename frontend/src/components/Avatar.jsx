// src/components/Avatar.jsx
import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const corresponding = {
  'p': 'viseme_PP',
  't': 'viseme_DD',
  'S': 'viseme_SH',
  'i': 'viseme_IH',
  'u': 'viseme_UH',
  'a': 'viseme_AA',
  '@': 'viseme_AE',
  'e': 'viseme_EH',
  'E': 'viseme_EY',
  'o': 'viseme_OW',
};

export function Avatar({ audioData, speechMarksData, onSpeechEnd, setIsSpeaking, ...props }) {
  const headFollow = true;
  const smoothMorphTarget = true;
  const morphTargetSmoothing = 0.5;

  const [audio, setAudio] = useState(null);

  const { nodes, materials } = useGLTF('/models/646d9dcdc8a5f5bddbfac913.glb');
  const idleAnimation = useFBX('/animations/Idle.fbx');
  idleAnimation.animations[0].name = 'Idle';

  const group = useRef();
  const { actions } = useAnimations([idleAnimation.animations[0]], group);

  const [animation, setAnimation] = useState('Idle');

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.5).play();
    return () => actions[animation]?.fadeOut(0.5);
  }, [animation, actions]);

  useEffect(() => {
    if (audioData && speechMarksData) {

      const newAudio = new Audio(`data:audio/mp3;base64,${audioData}`);
      setAudio(newAudio);

      // Set isSpeaking to true
      if (setIsSpeaking) {
        setIsSpeaking(true);
      }

      newAudio.play().catch((error) => {
        console.error('Error playing audio:', error);
        alert('Failed to play audio. Please try again.');
      });

      const handleAudioEnded = () => {
        setAnimation('Idle');
        // Set isSpeaking to false
        if (setIsSpeaking) {
          setIsSpeaking(false);
        }
        // Call onSpeechEnd callback
        if (onSpeechEnd) {
          onSpeechEnd();
        }
      };

      newAudio.addEventListener('ended', handleAudioEnded);

      setAnimation('Idle');

      return () => {
        newAudio.removeEventListener('ended', handleAudioEnded);
      };
    }
  }, [audioData, speechMarksData, setIsSpeaking, onSpeechEnd, setAnimation]);

  useFrame((state) => {
    if (headFollow && group.current) {
      const head = group.current.getObjectByName('Head');
      if (head) {
        head.lookAt(state.camera.position);
      }
    }
  });

  useFrame(() => {
    if (!audio || !speechMarksData || !nodes.Wolf3D_Head || !nodes.Wolf3D_Teeth) return;

    const currentAudioTime = audio.currentTime * 1000;

    if (audio.paused || audio.ended) {
      setAnimation('Idle');
      return;
    }

    // Reset morph target influences
    Object.values(corresponding).forEach((value) => {
      const headIndex = nodes.Wolf3D_Head.morphTargetDictionary[value];
      const teethIndex = nodes.Wolf3D_Teeth.morphTargetDictionary[value];

      if (headIndex !== undefined) {
        nodes.Wolf3D_Head.morphTargetInfluences[headIndex] = smoothMorphTarget
          ? THREE.MathUtils.lerp(
              nodes.Wolf3D_Head.morphTargetInfluences[headIndex],
              0,
              morphTargetSmoothing
            )
          : 0;
      }
      if (teethIndex !== undefined) {
        nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex] = smoothMorphTarget
          ? THREE.MathUtils.lerp(
              nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex],
              0,
              morphTargetSmoothing
            )
          : 0;
      }
    });

    // Find the current viseme
    const currentTimeMs = currentAudioTime;

    for (let i = 0; i < speechMarksData.length; i++) {
      const viseme = speechMarksData[i];
      const startTime = viseme.time;
      const endTime = speechMarksData[i + 1] ? speechMarksData[i + 1].time : audio.duration * 1000;

      if (currentTimeMs >= startTime && currentTimeMs < endTime) {
        const morphTargetName = corresponding[viseme.value];
        if (!morphTargetName) break;

        const headIndex = nodes.Wolf3D_Head.morphTargetDictionary[morphTargetName];
        const teethIndex = nodes.Wolf3D_Teeth.morphTargetDictionary[morphTargetName];

        if (headIndex !== undefined) {
          nodes.Wolf3D_Head.morphTargetInfluences[headIndex] = smoothMorphTarget
            ? THREE.MathUtils.lerp(
                nodes.Wolf3D_Head.morphTargetInfluences[headIndex],
                1,
                morphTargetSmoothing
              )
            : 1;
        }
        if (teethIndex !== undefined) {
          nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex] = smoothMorphTarget
            ? THREE.MathUtils.lerp(
                nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex],
                1,
                morphTargetSmoothing
              )
            : 1;
        }
        break;
      }
    }
  });

  return (
    <>
      <group {...props} dispose={null} ref={group} position={[0, -1, 1.5]}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
    </>
  );
}

useGLTF.preload('/models/646d9dcdc8a5f5bddbfac913.glb');
