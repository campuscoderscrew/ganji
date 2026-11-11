import { resolveContent } from './data/site-content';
import { getSiteData, getPreview, usePreview } from './lib/preview';
import chungha from './Chungha.png';
import comingSoon from './ComingSoon.png';
import icon from './ganjiLogoWhite.png';
import group from './groupPhoto.jpg';

const images = { chungha, 'coming-soon': comingSoon, icon, group };
export const imageUrl = value => getPreview()?.images[value] || images[value] || value || comingSoon;
export const useContent = () => { usePreview(); return { content: resolveContent(getSiteData()) }; };
export const videoSearch = item => item.videoLink || `https://www.youtube.com/results?search_query=${encodeURIComponent('Ganji UMD ' + item.title + ' ' + (item.artist || ''))}`;
