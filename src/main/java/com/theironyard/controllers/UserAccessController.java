package com.theironyard.controllers;

import com.theironyard.entities.User;
import com.theironyard.services.UserRepository;
import com.theironyard.utilities.PasswordStorage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Created by kelseynewman on 2/17/17.
 */
@Controller
public class UserAccessController {
    @Autowired
    UserRepository users;

    @PostConstruct
    public void init() {

    }

    @RequestMapping(path = "/login", method = RequestMethod.POST)
    public String login(HttpSession session, String email, String password) throws Exception{
        User user = users.findFirstByEmail(email);
        if (user == null) {
            return "redirect:notLoggedIn.html";
        } else if (!PasswordStorage.verifyPassword(password, user.getPassword())) {
            throw new Exception("Incorrect Password");
        }
        session.setAttribute("email", email);
        return "redirect:/";
        //todo find out how to send back user's info
    }

    @RequestMapping(path = "/registration", method = RequestMethod.POST)
    public String register(HttpSession session, String email, String password,
                         Integer readingLevel, String category, int [] location, Integer age) throws Exception {
        User newUser = new User(email,
                PasswordStorage.createHash(password),
                readingLevel,
                category,
                location,
                age);
        users.save(newUser);
        session.setAttribute("email", email);
        return "redirect:/";
    }

    @RequestMapping("/logout")
    public String logout(HttpSession session) throws IOException {
        session.invalidate();
        return "redirect:notLoggedIn.html";
    }
}
