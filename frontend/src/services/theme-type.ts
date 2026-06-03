
export enum Theme {
    Dark = 'dark',
    Light = 'light'
}

export enum ThemeImage {
    'dark' = '/assets/theme/sun.svg',
    'light' = '/assets/theme/moon.svg'
}


export const getTheme = (): Theme => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme === Theme.Dark || savedTheme === Theme.Light
        ? savedTheme
        : Theme.Dark;
};

export const toggleTheme = (): Theme => {
    const savedTheme = localStorage.getItem('theme') as Theme || Theme.Dark ;
    const theme = savedTheme === Theme.Dark ? Theme.Light : Theme.Dark
    localStorage.setItem('theme', theme);
    return theme
};