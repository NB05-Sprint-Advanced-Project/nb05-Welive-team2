// import { createBaseController } from '../../../utils/controller-util';

// export const createAuthController = (authService: AuthCommandService) => {
//   const { path, router } = createBaseController('/api/v2/auth');

//   const login = async (req: any, res: any) => {
//     const { username, password } = req.body;
//     const { user, token } = await authService.login(username, password);

//     res.cookie('access_token', token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: 'none',
//       maxAge: 15 * 60 * 1000, // 15분
//       path: '/',
//     });

//     // res.cookie("refresh_token", refreshToken, {
//     //     httpOnly: true,
//     //     secure: true,
//     //     sameSite: "none",
//     //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
//     //     path: "/",
//     // });

//     return res.status(200).json(user);
//   };

//   const logout = async (req: any, res: any) => {
//     const token = req.headers['authorization']?.split(' ')[1];
//     if (token) {
//       await authService.logout(token);
//     }
//     return res.status(204).send();
//   };

//   const refreshToken = async (req: any, res: any) => {
//     // const oldToken = req.headers['authorization']?.split(' ')[1];
//     // if (!oldToken) {
//     //     return res.status(401).send();
//     // }
//     // const { token: newToken } = await authService.refreshToken(oldToken);
//     // res.setHeader("Authorization", `Bearer ${newToken}`);
//     return res.status(204).send();
//   };

//   router.post('/login', login);
//   router.post('/logout', logout);
//   router.post('/refresh', refreshToken);

//   return { path, router };
// };
